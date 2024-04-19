"use client";
import { useState, useEffect, use } from "react";
import { User } from "@/models/User";
import axios from "axios";

import { Button } from "@/components/ui/button";

import AccountMenu from "@/components/account/account-menu";
import Promptle from "@/components/game/promptle";
import PromptleTimer from "@/components/game/promptle-timer";
import { set } from "mongoose";

const givenTime = 10;

export default function Game({ params }: { params: { id: string } }) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPromptles, setLoadingPromptles] = useState(true);
  const [account, setAccount] = useState<User | null>(null);
  const [promptleUpdated, setPromptleUpdated] = useState(false);
  const [currentPromptleIndex, setCurrentPromptleIndex] = useState(0);
  const [promptleCounr, setPromptleCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(givenTime);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : null;

    setAccount(user);
    fetchGame();
    loadPromptles();
  }, [game, loadingPromptles]);

  async function fetchGame() {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/${params.id}`,
      {
        params: { id: params.id },
      }
    );
    const data = res.data;
    setGame(data);
    setPromptleCount(data.promptles.length);
    setLoading(false);
  }

  async function loadPromptles() {
    if (!game) return;
    const gamePromptles = (game as any)?.promptles;
    for (let i = 0; i < gamePromptles.length; i++) {
      const promptle = gamePromptles[i];
      if (promptle.status === "completed") continue;
      await getPromptleImagesAndUpdate(
        promptle._id,
        promptle.prompt_id,
        "690204"
      );
    }
    setLoadingPromptles(false);
  }

  const handleNextPromptle = () => {
    if (currentPromptleIndex < promptleCounr - 1) {
      setCurrentPromptleIndex(currentPromptleIndex + 1);
      setSecondsLeft(givenTime);
    }
  };
  async function getPromptleImagesAndUpdate(
    promptleId: string,
    promptId: string,
    modelId: string
  ) {
    try {
      const result = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/promptles/prompts/${promptId}`,
        {
          params: { model_id: modelId, prompt_id: promptId },
        }
      );
      const promptleImages = result.data.data.images;

      const promptleData = {
        images: promptleImages,
        status: "completed",
      };
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/promptles/${promptleId}`,
        promptleData,
        { params: { id: promptleId } }
      );
      const data = res.data;
      console.log("Promptle updated", data);
      setPromptleUpdated(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <AccountMenu />
      <div className="flex flex-col items-center justify-center h-screen">
        {loading ? (
          <div>Loading...</div>
        ) : (
          game && (
            <>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-10">
                  {(game as any)?.promptles.map(
                    (promptle: any, index: number) => (
                      <div key={promptle._id} className="mt-4">
                        {index === currentPromptleIndex && (
                          <Promptle
                            promptle={promptle}
                            secondsLeft={secondsLeft}
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
                <div className="col-span-2 mt-4">
                  <PromptleTimer
                    initialSeconds={givenTime}
                    secondsLeft={secondsLeft}
                    setSecondsLeft={setSecondsLeft}
                  />
                </div>
              </div>
              <Button onClick={handleNextPromptle}>Next Promptle</Button>
            </>
          )
        )}
      </div>
    </div>
  );
}