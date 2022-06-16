//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract NftCollection is ERC721Enumerable, Ownable {
    string _baseTokenURI;
    uint256 public _price = 0.01 ether;
    bool public _paused;
    uint256 public maxTokenIds = 20;
    uint256 public tokenIds;
    IWhitelist whitelist;
    bool public presaleStarted;
    uint256 public presaleEnded;

    constructor(string memory baseURL, address whitelistContract)
        ERC721("Shiki Devs", "SKD")
    {
        _baseTokenURI = baseURL;
        whitelist = IWhitelist(whitelistContract);
    }

    // Start presale for whitelisted addresses
    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }

    // Allow users to mint one NFT per transaction during presale
    function presaleMint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp < presaleEnded,
            "Presale ended!"
        );
        require(
            whitelist.whitelistedAddresses(msg.sender),
            "You are not in whitelist!"
        );
        require(tokenIds < maxTokenIds, "No more NFTs to mint!");
        require(msg.value >= _price, "Ether sent is not correct!");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    // Allow users to mint 1 NFT per transaction after presale
    function mint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "Presale has not ended yet!"
        );
        require(tokenIds < maxTokenIds, "No more NFTs to mint!");
        require(msg.value >= _price, "Ether sent is not correct!");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    // Overrides the Openzeppelin's ERC721 implementation,
    // which by default returns an empty string for the baseURI
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    // Pause or unpause contract
    function setPaused(bool value) public onlyOwner {
        _paused = value;
    }

    // Sends all ether in the contract to the owner
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether!");
    }

    // Function to receive Ether when msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    modifier onlyWhenNotPaused() {
        require(!_paused, "Contract currently paused!");
        _;
    }
}
