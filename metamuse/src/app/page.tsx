"use client";
import React from "react";
import { Palette, Wallet, Users, CheckCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

function Home() {
  const router = useRouter();

  const join = () => {
    router.push("/auth/signup");
  };

  const start = () => {
    router.push("/auth/login");
  };

  return (
    <div className="h-screen bg-[#0F1626] text-white overflow-auto">
      {/* Hero Section */}

      <header className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0F1626] text-center">
  {/* Clickable Logo with Supabase Link */}
  <a href="/">
    <img
      src="https://cocozqaswhyugfbilbxk.supabase.co/storage/v1/object/public/Codex-Lab//logo.png" // Replace with the correct Supabase link
      alt="Metamuse Logo"
      className="mx-auto w-32 h-auto mb-6 cursor-pointer"
    />
  </a>

  <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#F68C1F] to-[#F68C1F]/80">
    Unleash Your Creativity.<br />Own Your Art.
  </h1>
  <p className="text-xl md:text-2xl text-[#F68C1F]/80 mb-8 max-w-3xl mx-auto">
    Metamuse is the ultimate platform for artists to collaborate, create, and mint digital masterpieces. Showcase your work, auction your art, and earn from your creativity—secured on the Sui Blockchain.
  </p>

  <button
    onClick={join}
    className="bg-[#F68C1F] hover:bg-[#D97A1D] text-white px-8 py-4 rounded-full text-xl font-semibold transition-all transform hover:scale-105"
  >
    Join Metamuse Today
  </button>
</header>



      {/* Sections */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F1626]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#F68C1F]">
            What is Metamuse?
          </h2>
          <p className="text-xl text-[#F68C1F]/80 text-center mb-16 max-w-4xl mx-auto">
            Metamuse is a next-gen platform designed for artists to collaborate, produce artwork, mint NFTs, and auction them to collectors worldwide. Built on Sui Blockchain, Metamuse ensures fast transactions, low fees, and true ownership for creators.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#0F1626]/60 p-8 rounded-2xl shadow-lg">
              <Palette className="w-12 h-12 text-[#F68C1F] mb-4" />
              <h3 className="text-2xl font-semibold mb-4">For Artists</h3>
              <p className="text-[#F68C1F]/80">Mint your art into NFTs and showcase it in an exclusive marketplace.</p>
            </div>
            <div className="bg-[#0F1626]/60 p-8 rounded-2xl shadow-lg">
              <Wallet className="w-12 h-12 text-[#F68C1F] mb-4" />
              <h3 className="text-2xl font-semibold mb-4">For Collectors</h3>
              <p className="text-[#F68C1F]/80">Discover rare, high-value artworks and bid seamlessly.</p>
            </div>
            <div className="bg-[#0F1626]/60 p-8 rounded-2xl shadow-lg">
              <Users className="w-12 h-12 text-[#F68C1F] mb-4" />
              <h3 className="text-2xl font-semibold mb-4">For Collaborators</h3>
              <p className="text-[#F68C1F]/80">Team up with other artists and earn together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-[#0F1626]">
        <h2 className="text-3xl font-bold mb-8 text-[#F68C1F]">
          Ready to turn your art into value?
        </h2>
        <button
          onClick={start}
          className="bg-[#F68C1F] hover:bg-[#D97A1D] text-white px-8 py-4 rounded-full text-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
        >
          Start Creating Now
          <ArrowRight className="w-6 h-6" />
        </button>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#0F1626] border-t border-[#F68C1F]/40">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-6 text-[#F68C1F]">
            Join the Metamuse Movement!
          </h3>
          <p className="text-[#F68C1F]/70 mb-8 max-w-2xl mx-auto">
            Be part of the future of art & blockchain. Whether you're an artist, a collector, or just curious—Metamuse is your gateway to limitless creativity on Sui.
          </p>
          <button
            onClick={join}
            className="bg-[#F68C1F] hover:bg-[#D97A1D] text-white px-6 py-3 rounded-full font-semibold mb-8"
          >
            Sign Up & Mint Your First NFT
          </button>
          <p className="text-[#F68C1F]/60">
            Have questions? Contact us at{" "}
            <a
              href="mailto:support@metamuse.io"
              className="text-[#F68C1F] hover:text-[#D97A1D]"
            >
              support@metamuse.io
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
