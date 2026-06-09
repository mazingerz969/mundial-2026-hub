import Phaser from "phaser";

const TEXTURE_KEYS = {
  pitch: "penalty-pitch",
  goal: "penalty-goal",
  ball: "penalty-ball",
  keeper: "penalty-keeper",
} as const;

export function generatePenaltyTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.ball)) return;

  const pitch = scene.make.graphics({ x: 0, y: 0 });
  pitch.fillGradientStyle(0x0a1628, 0x0a1628, 0x0f2840, 0x0f2840, 1);
  pitch.fillRect(0, 0, 480, 200);
  for (let i = 0; i < 50; i++) {
    pitch.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.08, 0.4));
    pitch.fillCircle(
      Phaser.Math.Between(0, 480),
      Phaser.Math.Between(4, 130),
      Phaser.Math.FloatBetween(0.6, 1.8),
    );
  }
  pitch.fillGradientStyle(0x14532d, 0x14532d, 0x166534, 0x166534, 1);
  pitch.fillRect(0, 200, 480, 160);
  pitch.lineStyle(2, 0xffffff, 0.22);
  pitch.strokeCircle(240, 310, 52);
  pitch.lineStyle(3, 0xffffff, 0.32);
  pitch.strokeRect(48, 200, 384, 130);
  pitch.fillStyle(0xffffff, 0.9);
  pitch.fillCircle(240, 292, 4);
  pitch.generateTexture(TEXTURE_KEYS.pitch, 480, 360);
  pitch.destroy();

  const goal = scene.make.graphics({ x: 0, y: 0 });
  goal.fillStyle(0xffffff, 0.08);
  goal.fillRect(0, 0, 264, 88);
  goal.lineStyle(6, 0xffffff, 1);
  goal.strokeRect(0, 0, 264, 88);
  goal.lineStyle(1, 0xffffff, 0.22);
  for (let i = 0; i <= 11; i++) {
    const nx = (264 / 11) * i;
    goal.lineBetween(nx, 0, nx, 88);
  }
  for (let j = 0; j <= 4; j++) {
    const ny = (88 / 4) * j;
    goal.lineBetween(0, ny, 264, ny);
  }
  goal.lineStyle(5, 0xffffff, 1);
  goal.lineBetween(0, 88, 0, 102);
  goal.lineBetween(264, 88, 264, 102);
  goal.generateTexture(TEXTURE_KEYS.goal, 264, 102);
  goal.destroy();

  const ball = scene.make.graphics({ x: 0, y: 0 });
  ball.fillStyle(0xffffff, 1);
  ball.fillCircle(16, 16, 15);
  ball.lineStyle(2, 0x111827, 0.9);
  ball.strokeCircle(16, 16, 15);
  ball.lineStyle(1.5, 0x111827, 0.75);
  ball.strokeCircle(16, 10, 5);
  ball.strokeCircle(10, 20, 5);
  ball.strokeCircle(22, 20, 5);
  ball.lineBetween(16, 4, 16, 28);
  ball.lineBetween(6, 16, 26, 16);
  ball.generateTexture(TEXTURE_KEYS.ball, 32, 32);
  ball.destroy();

  const keeper = scene.make.graphics({ x: 0, y: 0 });
  keeper.fillStyle(0x1e3a5f, 1);
  keeper.fillRoundedRect(24, 72, 32, 20, 4);
  keeper.fillStyle(0xfbbf24, 1);
  keeper.fillRoundedRect(18, 28, 44, 46, 6);
  keeper.fillStyle(0xfde68a, 1);
  keeper.fillCircle(40, 16, 13);
  keeper.fillStyle(0x111827, 0.8);
  keeper.fillCircle(35, 14, 2);
  keeper.fillCircle(45, 14, 2);
  keeper.fillStyle(0xffffff, 1);
  keeper.fillEllipse(8, 44, 18, 14);
  keeper.fillEllipse(72, 44, 18, 14);
  keeper.lineStyle(2, 0x111827, 0.5);
  keeper.strokeEllipse(8, 44, 18, 14);
  keeper.strokeEllipse(72, 44, 18, 14);
  keeper.fillStyle(0x22c55e, 1);
  keeper.fillRect(28, 34, 24, 6);
  keeper.generateTexture(TEXTURE_KEYS.keeper, 80, 96);
  keeper.destroy();
}

export { TEXTURE_KEYS };
