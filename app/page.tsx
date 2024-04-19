"use client";
import AccountMenu from "@/components/account/account-menu";
import { useState, useEffect } from "react";
import GameCard from "@/components/game/game-card";

// async function getGames() {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/games`, {
//     next: { revalidate: 5 },
//   });
//   const data = await res.json();
//   return data;
// }
export default function Home() {
  const [games, setGames] = useState([]);

  const getGames = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/games`, {
      next: { revalidate: 5 },
    });
    const data = await res.json();
    setGames(data);
  };

  useEffect(() => {
    getGames();
  }, []);

  return (
    <div>
      <AccountMenu />
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <div className="grid grid-cols-12 gap-2">
          {games &&
            games.map((game: any) => (
              <div className="col-span-3" key={game._id}>
                <GameCard game={game} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
