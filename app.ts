import { AnimatedSprite, Application, Loader, Sprite } from "pixi.js";
import { Viewport } from "pixi-viewport";

const SPEED = 5;

const app = new Application({ resizeTo: window });
document.body.appendChild(app.view);

const { backgroundSprite, idleSprite, walkingSprite } = await loadSprites();

const viewport = new Viewport({
  screenWidth: app.view.width,
  screenHeight: app.view.height,
  worldWidth: backgroundSprite.width,
  worldHeight: backgroundSprite.height,
  interaction: app.renderer.plugins.interaction,
});
viewport.setZoom(0.5);
window.onresize = () => viewport.resize();
app.stage.addChild(viewport);

viewport.addChild(backgroundSprite);

walkingSprite.animationSpeed = 0.3;
walkingSprite.play();
walkingSprite.setTransform(backgroundSprite.width / 2, backgroundSprite.height / 2);
viewport.follow(walkingSprite);
viewport.addChild(walkingSprite);

let target = { x: walkingSprite.x, y: walkingSprite.y };

viewport.on("clicked", (e) => {
  target = { x: e.world.x, y: e.world.y };
});

app.ticker.add(() => {
  const dx = target.x - walkingSprite.x;
  const dy = target.y - walkingSprite.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= SPEED) {
    walkingSprite.x = target.x;
    walkingSprite.y = target.y;
  } else {
    walkingSprite.x += (dx / dist) * SPEED;
    walkingSprite.y += (dy / dist) * SPEED;
  }
  if (dx > 0) {
    walkingSprite.scale.x = 1;
  } else if (dx < 0) {
    walkingSprite.scale.x = -1;
  }
});

function loadSprites(): Promise<{ backgroundSprite: Sprite; idleSprite: Sprite; walkingSprite: AnimatedSprite }> {
  return new Promise((resolve) => {
    new Loader()
      .add("background", "The_Skeld_map.png")
      .add("character", "idle.png")
      .add("walk", "walk.json")
      .load((_, resources) => {
        resolve({
          backgroundSprite: new Sprite(resources.background.texture),
          idleSprite: new Sprite(resources.character.texture),
          walkingSprite: new AnimatedSprite(resources.walk.spritesheet!.animations.walkcolor),
        });
      });
  });
}
