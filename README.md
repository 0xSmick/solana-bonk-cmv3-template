# Intro
This is a Mint Page which can work with CMV3 (Candy Machine V3) for NFT drops. This was created purely as a fun project and is free for anyone to use. 

# Candymachine setup
1. Download sugar's latest [build](https://github.com/metaplex-foundation/sugar/tree/alpha+CMv3)
2. Create a candy machine with the tokenPayment guard. Set the mint to the token mint address and the destination ata to the account of your treasury wallet which will hold the token.
3. Deploy the CM and add the guard. Copy the CM address.

# Webapp setup
1. ```yarn``` and then ```yarn dev```
2. edit the env to add your CM and the image you want displayed on the site.
3. To change the minting animation, create your own gif of your images.

Shoutout to @urbentom for the original skeleton.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
