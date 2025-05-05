"use client"
import React from 'react';
import { Palette, Wallet, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function Home() {
  const router = useRouter()

  const join = () => {
    router.push('/auth/signup')
  }

  const start = () => {
    router.push("auth/login")
  }
  return (
    <div className="h-screen bg-gradient-to-b from-white to-red-50 text-gray-900 overflow-auto border border-red-500">
      {/* Hero Section */}
      <header className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80"
            alt="Digital Art Background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-red-50"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
            Unleash Your Creativity.<br/>Own Your Art.
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Metamuse is the ultimate platform for artists to collaborate, create, and mint digital masterpieces. Showcase your work, auction your art, and earn from your creativity—secured on the Sui Blockchain.
          </p>
          
          <div className="flex justify-center gap-8 text-lg mb-12">
            <div className="flex items-center gap-2">
              <span className="text-red-600">🔹</span>
              <span>CO-Create</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600">🔹</span>
              <span>Mint</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600">🔹</span>
              <span>Sell</span>
            </div>
          </div>
          
          <button onClick={join} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all transform hover:scale-105">
            Join Metamuse Today
          </button>
        </div>
      </header>

      {/* What is Metamuse Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-tan-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">What is Metamuse?</h2>
          <p className="text-xl text-gray-700 text-center mb-16 max-w-4xl mx-auto">
            Metamuse is a next-gen platform designed for artists to collaborate, produce artwork, mint NFTs, and auction them to collectors worldwide. Built on Sui Blockchain, Metamuse ensures fast transactions, low fees, and true ownership for creators.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Palette className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-4">For Artists</h3>
              <p className="text-gray-600">Mint your art into NFTs and showcase it in an exclusive marketplace.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Wallet className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-4">For Collectors</h3>
              <p className="text-gray-600">Discover rare, high-value artworks and bid seamlessly.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Users className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-4">For Collaborators</h3>
              <p className="text-gray-600">Team up with other artists and earn together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Metamuse Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Why Choose Metamuse?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Seamless Minting – Convert your artwork into NFTs in a few clicks.",
              "Built on Sui – Enjoy ultra-fast transactions and low gas fees.",
              "True Ownership – Your art remains yours, secured on-chain.",
              "Zero Middlemen – Get paid directly for your creativity.",
              "Community-Driven – Engage with fellow artists & collectors worldwide."
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-lg">
                <CheckCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-600">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-red-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">How It Works?</h2>
          <div className="grid md:grid-cols-5 gap-8">
            {[
              "Sign Up & Connect Your Wallet",
              "Create or Collaborate on Artwork",
              "Mint & List for Sale on Sui",
              "Auction or Direct Sell to Collectors",
              "Get Paid Instantly in Crypto"
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <p className="text-gray-600">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Ready to turn your art into value?</h2>
          <button onClick={start} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2 mx-auto">
            Start Creating Now
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-red-100">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Join the Metamuse Movement!</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of the future of art & blockchain. Whether you're an artist, a collector, or just curious—Metamuse is your gateway to limitless creativity on Sui.
          </p>
          <button onClick={join} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold mb-8">
            Sign Up & Mint Your First NFT
          </button>
          <p className="text-gray-500">
            Have questions? Contact us at{' '}
            <a href="mailto:support@metamuse.io" className="text-red-600 hover:text-red-500">
              support@metamuse.io
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;