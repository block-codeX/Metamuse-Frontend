"use client"

import { Button } from '@/components/ui/button';
import * as Popover from '@radix-ui/react-popover';
import { Clock, Tag, Wallet } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';




interface NFTDetails {
  id: string
  name: string
  description: string
  currentPrice: string
  minimumBid: string
  endTime: string
  imageUrl: string
  owner: string
}

export default function PopupExample() {
  const [isLoading, setIsLoading] = useState(false)

  const nft: NFTDetails = {
    id: "1234",
    name: "Cosmic Voyager #42",
    description: "A rare cosmic explorer NFT from the Voyager collection. One of only 100 ever minted.",
    currentPrice: "0.5",
    minimumBid: "0.55",
    endTime: "3 hours",
    imageUrl: "/nft image.avif",
    owner: "0x1a2b...3c4d",
  }



  const handleBuyNow = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsLoading(true)
    console.log("NFT bought")
    setIsLoading(false)
  }


  return (
    <div className="flex justify-center w-full items-center h-screen">
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="bg-red-600 text-white rounded-lg py-3 px-5 cursor-pointer "  >Buy button</button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-white p-4 rounded-lg shadow-lg border flex items-center justify-center gap-5"
            sideOffset={5}
          >

            <div className=' w-[200px] h-[200px] bg-red-700 hidden md:block ' >
              <Image src={nft.imageUrl} alt='' height={100} width={100} className='object-cover  w-full h-full ' />
            </div>
            <form action="" className=' w-full flex flex-col items-start justify-evenly gap-2.5 min-w-[300px] max-w-[400px] ' >
              <header>
                <h1 > {nft.id} </h1>
                <p> {nft.description} </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Wallet className="h-4 w-4" />
                  <span>Owned by {nft.owner}</span>
                </div>
              </header>

              <div className="flex gap-10 justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Current price</span>
                </div>
                <div className="font-bold text-lg">{nft.currentPrice} ETH</div>
              </div>

              <div className="flex gap-10 justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Auction ends in</span>
                </div>
                <p>{nft.endTime} </p>
              </div>

              <div className="p-4 bg-muted rounded-lg w-full">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Buy now price</span>
                  <span className="font-bold text-lg">{nft.currentPrice} ETH</span>
                </div>
              </div>

              <Button className="rounded-[10px] cursor-pointer bg-btn-primary dark:bg-btn-primary w-full hover:bg-red-950 " size="lg" onClick={handleBuyNow} disabled={isLoading}>
                {isLoading ? "Processing..." : "Buy Now"}
              </Button>




              <div>
                <p>Gas fees and network charges may apply.</p>
                <p>All transactions are secured on the blockchain.</p>
              </div>

            </form>
            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
