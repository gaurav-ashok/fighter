//set main namespace
goog.provide('fighter');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.RoundedRect');

goog.require('fighter.NUKeyframeAnimation');

// entrypoint
fighter.start = function () {

    var director = new lime.Director(document.body, 800, 600);
    director.makeMobileWebAppCapable();
    director.setDisplayFPS(true);

    var defaultScene = new lime.Scene();
    var defaultLayer = new lime.Layer()
        .setPosition(0, 0)
        .setRenderer(lime.Renderer.CANVAS)
        .setAnchorPoint(0, 0);

    var sprite = new lime.RoundedRect()
        .setRadius(10)
        .setSize(50, 50)
        .setPosition(100, 200);

    var anim = new fighter.NUKeyframeAnimation()
        .setDelaysArray([0.15, 0.15, 0.15, 0.15, 0.15])
        .addFrame('#c00').addFrame('#0c0').addFrame('#00c').addFrame('#c0c').addFrame('#0cc');
    anim.setLooping(true);

    sprite.runAction(anim);

    defaultLayer.appendChild(sprite);
    defaultScene.appendChild(defaultLayer);
    director.replaceScene(defaultScene);
}