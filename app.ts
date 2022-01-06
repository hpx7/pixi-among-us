import { AnimatedSprite, Application, Loader, Sprite, Texture } from "pixi.js";
import { Viewport } from "pixi-viewport";

const SPEED = 5;

const app = new Application({ resizeTo: window });
document.body.appendChild(app.view);

const { backgroundTexture, idleTextures, walkingTextures } = await loadTextures();

const viewport = new Viewport({
  screenWidth: app.view.width,
  screenHeight: app.view.height,
  worldWidth: backgroundTexture.width,
  worldHeight: backgroundTexture.height,
  interaction: app.renderer.plugins.interaction,
});
viewport.setZoom(0.5);
window.onresize = () => viewport.resize();
app.stage.addChild(viewport);

viewport.addChild(new Sprite(backgroundTexture));

const player = new AnimatedSprite(idleTextures);
player.anchor.set(0.5, 1);
player.setTransform(backgroundTexture.width / 2, backgroundTexture.height / 2);

viewport.follow(player);
viewport.addChild(player);

let target = { x: player.x, y: player.y };

viewport.on("clicked", (e) => {
  target = { x: e.world.x, y: e.world.y };
});

app.ticker.add(() => {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) {
    player.textures = idleTextures;
  } else {
    if (!player.playing) {
      player.textures = walkingTextures;
      player.animationSpeed = 0.3;
      player.play();
    }
    if (dist <= SPEED) {
      player.x = target.x;
      player.y = target.y;
    } else {
      player.x += (dx / dist) * SPEED;
      player.y += (dy / dist) * SPEED;
    }
    if (dx > 0) {
      player.scale.x = 1;
    } else if (dx < 0) {
      player.scale.x = -1;
    }
  }
});

function loadTextures(): Promise<{ backgroundTexture: Texture; idleTextures: Texture[]; walkingTextures: Texture[] }> {
  return new Promise((resolve) => {
    new Loader()
      .add("background", "The_Skeld_map.png")
      .add("character", "idle.png")
      .add("walk", "walk.json")
      .load((_, resources) => {
        resolve({
          backgroundTexture: resources.background.texture!,
          idleTextures: [resources.character.texture!],
          walkingTextures: resources.walk.spritesheet!.animations.walkcolor,
        });
      });
  });
}
