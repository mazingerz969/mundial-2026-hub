import Phaser from "phaser";

import { PENALTY_SCENE_KEY, PenaltyScene } from "@/lib/games/tanda90/phaser/PenaltyScene";

export interface PenaltyGameOptions {
  width?: number;
  height?: number;
}

export function createPenaltyGame(
  parent: HTMLElement,
  ballColor: string,
  options: PenaltyGameOptions = {},
): Phaser.Game {
  const width = options.width ?? 480;
  const height = options.height ?? 360;

  return new Phaser.Game({
    type: Phaser.AUTO,
    width,
    height,
    parent,
    backgroundColor: "#0b1a0f",
    scene: PenaltyScene,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    fps: {
      target: 60,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
    },
    callbacks: {
      preBoot: (game) => {
        game.registry.set("ballColor", ballColor);
      },
    },
  });
}

export { PENALTY_SCENE_KEY, PenaltyScene };
export type { ShotAnimationPayload } from "@/lib/games/tanda90/phaser/PenaltyScene";
