import { Application, Loader, Sprite } from "pixi.js";
import { Viewport } from "pixi-viewport";

const SPEED = 5;

const app = new Application({ resizeTo: window });
document.body.appendChild(app.view);

const { backgroundSprite, characterSprite } = await loadSprites();

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

characterSprite.anchor.set(0.5);
characterSprite.setTransform(backgroundSprite.width / 2, backgroundSprite.height / 2);
viewport.follow(characterSprite);
viewport.addChild(characterSprite);

let target = { x: characterSprite.x, y: characterSprite.y };

viewport.on("clicked", (e) => {
  target = { x: e.world.x, y: e.world.y };
});

app.ticker.add(() => {
  const dx = target.x - characterSprite.x;
  const dy = target.y - characterSprite.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= SPEED) {
    characterSprite.x = target.x;
    characterSprite.y = target.y;
  } else {
    characterSprite.x += (dx / dist) * SPEED;
    characterSprite.y += (dy / dist) * SPEED;
  }
});

function loadSprites(): Promise<{ backgroundSprite: Sprite; characterSprite: Sprite }> {
  const loader = new Loader();
  loader.add("background", "The_Skeld_map.png").add("character", "idle.png");
  return new Promise((resolve) => {
    loader.load((_, resources) => {
      resolve({
        backgroundSprite: new Sprite(resources.background.texture),
        characterSprite: new Sprite(resources.character.texture),
      });
    });
  });
}
