// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.tokenId;
  const image_url = `https://raw.githubusercontent.com/TamarawGuy/NFT-Collection/main/public/pics/${tokenId}.svg`;
  res.status(200).json({
    name: "Shiki Dev" + tokenId,
    description: "Shiki Dev NFTs",
    image: image_url + tokenId + ".svg",
  });
}
