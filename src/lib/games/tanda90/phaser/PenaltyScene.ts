import Phaser from "phaser";

import { generatePenaltyTextures, TEXTURE_KEYS } from "@/lib/games/tanda90/phaser/generateTextures";
import type { Corner, ShotResult } from "@/lib/games/tanda90/types";

export const PENALTY_SCENE_KEY = "PenaltyScene";

export interface ShotAnimationPayload {
  shooterCorner: Corner;
  keeperCorner: Corner;
  result: ShotResult;
  ballColor: string;
}

interface GoalBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const CORNER_X: Record<Corner, number> = {
  left: 0.22,
  center: 0.5,
  right: 0.78,
};

export class PenaltyScene extends Phaser.Scene {
  private ball!: Phaser.GameObjects.Image;

  private keeper!: Phaser.GameObjects.Image;

  private keeperBaseX = 0;

  private keeperBaseY = 0;

  private resultText!: Phaser.GameObjects.Text;

  private ballSpot = { x: 240, y: 292 };

  private goal: GoalBounds = { x: 108, y: 48, width: 264, height: 88 };

  private isAnimating = false;

  private idleTween: Phaser.Tweens.Tween | null = null;

  private ballTint = 0xffffff;

  constructor() {
    super(PENALTY_SCENE_KEY);
  }

  preload() {
    generatePenaltyTextures(this);
  }

  create() {
    this.add.image(240, 180, TEXTURE_KEYS.pitch).setDepth(0);
    this.add.image(this.goal.x + this.goal.width / 2, this.goal.y + 51, TEXTURE_KEYS.goal).setDepth(2);

    (["left", "center", "right"] as Corner[]).forEach((corner) => {
      const cx = this.goal.x + this.goal.width * CORNER_X[corner];
      this.add
        .text(cx, this.goal.y + this.goal.height + 18, corner === "left" ? "IZQ" : corner === "right" ? "DER" : "CTR", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "10px",
          color: "#ffffff88",
        })
        .setOrigin(0.5)
        .setDepth(3);
    });

    this.createKeeper();
    this.createBall(this.registry.get("ballColor") ?? "#22c55e");

    this.resultText = this.add
      .text(240, 168, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(20);

    this.game.events.on("play-shot", this.handleShot, this);
    this.game.events.on("update-ball-color", this.updateBallColor, this);

    this.events.on("shutdown", () => {
      this.game.events.off("play-shot", this.handleShot, this);
      this.game.events.off("update-ball-color", this.updateBallColor, this);
    });

    this.startKeeperIdle();
  }

  private createKeeper() {
    const { x, y, width, height } = this.goal;
    this.keeperBaseX = x + width / 2;
    this.keeperBaseY = y + height + 18;

    this.keeper = this.add
      .image(this.keeperBaseX, this.keeperBaseY, TEXTURE_KEYS.keeper)
      .setOrigin(0.5, 1)
      .setDepth(8);
  }

  private createBall(color: string) {
    this.updateBallColor(color);
    this.ball = this.add
      .image(this.ballSpot.x, this.ballSpot.y, TEXTURE_KEYS.ball)
      .setOrigin(0.5)
      .setDepth(10)
      .setScale(0.9)
      .setTint(this.ballTint);
  }

  private updateBallColor(color: string) {
    const parsed = Phaser.Display.Color.HexStringToColor(color);
    this.ballTint = parsed.color;
    this.ball?.setTint(this.ballTint);
  }

  private startKeeperIdle() {
    this.idleTween?.stop();
    this.idleTween = this.tweens.add({
      targets: this.keeper,
      y: this.keeperBaseY + 4,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private resetPositions() {
    this.ball.setPosition(this.ballSpot.x, this.ballSpot.y);
    this.ball.setScale(0.9);
    this.ball.setAlpha(1);
    this.ball.setTint(this.ballTint);
    this.keeper.setPosition(this.keeperBaseX, this.keeperBaseY);
    this.keeper.setAngle(0);
    this.resultText.setAlpha(0);
    this.startKeeperIdle();
  }

  private targetForShot(corner: Corner, result: ShotResult) {
    const { x, y, width, height } = this.goal;
    let tx = x + width * CORNER_X[corner];
    let ty = y + height * 0.55;

    if (result === "miss") {
      ty = y - 28;
      if (corner === "left") tx = x - 36;
      else if (corner === "right") tx = x + width + 36;
    }

    return { x: tx, y: ty };
  }

  private keeperDiveTarget(corner: Corner) {
    const { x, width } = this.goal;
    return {
      x: x + width * CORNER_X[corner],
      y: this.keeperBaseY + 12,
      angle: corner === "left" ? -32 : corner === "right" ? 32 : 0,
    };
  }

  private handleShot(payload: ShotAnimationPayload) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.idleTween?.stop();

    this.updateBallColor(payload.ballColor);
    this.resetPositions();

    const target = this.targetForShot(payload.shooterCorner, payload.result);
    const dive = this.keeperDiveTarget(payload.keeperCorner);

    this.tweens.add({
      targets: this.keeper,
      x: dive.x,
      y: dive.y,
      angle: dive.angle,
      duration: 420,
      ease: "Cubic.easeOut",
    });

    this.tweens.add({
      targets: this.ball,
      x: target.x,
      y: target.y,
      scale: payload.result === "goal" ? 0.75 : 0.6,
      duration: 520,
      ease: "Quad.easeIn",
      onComplete: () => {
        if (payload.result === "save") {
          this.tweens.add({
            targets: this.ball,
            alpha: 0.5,
            scale: 0.35,
            duration: 180,
          });
        }

        const label =
          payload.result === "goal"
            ? "GOL"
            : payload.result === "save"
              ? "PARADA"
              : "FUERA";
        const color =
          payload.result === "goal"
            ? "#22c55e"
            : payload.result === "save"
              ? "#3b82f6"
              : "#f59e0b";

        this.resultText.setText(label);
        this.resultText.setColor(color);
        this.resultText.setAlpha(1);
        this.resultText.setScale(0.6);
        this.tweens.add({
          targets: this.resultText,
          scale: 1,
          duration: 220,
          ease: "Back.easeOut",
        });

        this.time.delayedCall(480, () => {
          this.isAnimating = false;
          this.game.events.emit("shot-animation-complete");
          this.resetPositions();
        });
      },
    });
  }
}
