goog.provide('fighter.NUKeyframeAnimation');


goog.require('goog.events');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Keyframe Animation object.
 * Keyframe Animation contains images that are changed on targets.
 * Similar to GIF effect.
 * @constructor
 * @extends lime.animation.Animation
 */
fighter.NUKeyframeAnimation = function () {
    lime.animation.Animation.call(this);

    /**
     * Array of frame images
     * @type {Array.<Image>}
     * @private
     */
    this.frames_ = [];

    /**
     * Number of frame images loaded
     * @type {number}
     * @private
     */
    this.numFramesLoaded_ = 0;

    /**
     * Have all the frames been loaded?
     * @type {boolean}
     * @private
     */
    //this.framesLoaded_ = false;

    /**
     * Animation is using Background Canvas
     * to make the changes. Faster if there are many targets
     * but only supported on Webkit.
     * @type {boolean}
     * @private
     */
    this.usesBackgroundCanvas_ = false;

    /**
     * Current frame index of the playhead
     * @type {number}
     * @private
     */
    this.currentFrame_ = -1;

    /**
     * Delay in seconds between frames
     * @type {number}
     */
    this.delays = [];

    /**
     * Should the animation keep looping or stop when frame animation done.
     * Setting loopoing to true, this is deafault behaviour.
     * @type {boolean}
     */
    this.looping = true;

    this.delays.push(0);
};
goog.inherits(fighter.NUKeyframeAnimation, lime.animation.Animation);


/** @inheritDoc */
fighter.NUKeyframeAnimation.prototype.scope = 'keyframe';

/**
 * Returns the delay in seconds between frames.
 * @return {number} Delay between frames.
 */
fighter.NUKeyframeAnimation.prototype.getDelay = function (at) {
    return this.delays[at];
};

/**
 * Set the delay between frames to specific value.
 * @param {number} value New delay value.
 * @return {fighter.NUKeyframeAnimation} object itself.
 */
fighter.NUKeyframeAnimation.prototype.setDelay = function (at, value) {
    this.delays[at] = value;
    return this;
};

/**
 * Returns the delays array in seconds between each frames.
 * @return {Array.<number>} Delay between frames.
 */
fighter.NUKeyframeAnimation.prototype.getDelaysArray = function () {
    return this.delays;
};

/**
 * Set the delays array.
 * @param {Array.<number>} value New delay value.
 * @return {fighter.NUKeyframeAnimation} object itself.
 */
fighter.NUKeyframeAnimation.prototype.setDelaysArray = function (value) {
    this.delays = [0].concat(value);
    return this;
};

/**
 * Set array of frames to be used in the animation
 * @param {Array.<string>} frames Paths to frame images.
 * @return {fighter.NUKeyframeAnimation} object itself.
 */
fighter.NUKeyframeAnimation.prototype.setFrames = function (frames) {
    this.frames_ = [];
    this.numFramesLoaded_ = 0;
    this.currentFrame_ = -1;

    for (var i = 0; i < frames.length; i++) {
        this.addFrame(lime.fill.parse([frames[i]]));
    }
    return this;
};

/**
 * Set the keyframe animation to keep loopoing or just play the animation once.
 * @param {boolean} looping Keep looping or not.
 * @return {fighter.NUKeyframeAnimation} object itself.
 */
fighter.NUKeyframeAnimation.prototype.setLooping = function (looping) {
    this.looping = looping;
    return this;
};

/**
 * Add frame to the current animation
 * @param {string|lime.fill.Fill} frame Path to frame image.
 * @return {fighter.NUKeyframeAnimation} object itself.
 */
fighter.NUKeyframeAnimation.prototype.addFrame = function (frame) {
    this.framesLoaded_ = false;

    var fill = lime.fill.parse(goog.array.toArray(arguments));

    if (fill.id == 'image' && !fill.isLoaded()) {
        goog.events.listen(fill, goog.events.EventType.LOAD,
            this.frameLoadedHandler_, false, this);
    } else if (fill.id == 'frame' && !frame.isProcessed()) {
        goog.events.listen(fill, 'processed', this.frameLoadedHandler_, false, this);
    } else {
        this.numFramesLoaded_++;
    }
    this.frames_.push(fill);
    return this;
};

/**
 * Handler to be called on every loaded frame image
 * @private
 */
fighter.NUKeyframeAnimation.prototype.frameLoadedHandler_ = function () {
    this.numFramesLoaded_++;
};



/**
 * @inheritDoc
 */
fighter.NUKeyframeAnimation.prototype.play = function () {

    this.lastChangeTime_ = 0;

    lime.animation.Animation.prototype.play.call(this);
};

/**
 * @inheritDoc
 */
fighter.NUKeyframeAnimation.prototype.updateAll = function (t, targets) {
    var nextDelay = this.currentFrame_ + 1;
    if (nextDelay > this.frames_.length)
        nextDelay = 1;

    var dt = this.dt_,
        delay_msec = Math.round(this.delays[nextDelay] * 1000),
        nextImage = null,
        i = targets.length,
        looping = this.looping,
        validframe;

    while (--i >= 0) {
        this.getTargetProp(targets[i]);
    }

    this.lastChangeTime_ += dt;
    var nextFrame = this.currentFrame_ + 1;
    if (this.lastChangeTime_ > delay_msec) {
        if (nextFrame < this.frames_.length) {
            validframe = true;
        } else if (looping && nextFrame >= this.frames_.length) {
            validframe = true;
            nextFrame = 0;
        } else {
            validframe = false;
        }
        if (validframe) {
            nextImage = this.frames_[nextFrame];

            i = targets.length;
            if (i > 0) {

                // Todo: make CSS Canvas optional
                /* if (!this.usesBackgroundCanvas_ &&
                 goog.isFunction(document.getCSSCanvasContext)) {

                 this.bgSprite = new lime.Sprite;
                 this.bgSprite.setRenderMode(lime.RenderMode.CSS_CANVAS);
                 this.bgSprite.setQuality(this.targets[0].getQuality());
                 this.usesBackgroundCanvas_ = true;

                 }
                if (this.usesBackgroundCanvas_) {
                    this.bgSprite.setFill(nextImage);
                     while (--i >= 0) {
                     this.targets[i].setRenderMode(
                     lime.RenderMode.BACKGROUND_CANVAS);
                     this.targets[i].setFill(this.bgSprite);
                     }
                }
                else {
                    */
                while (--i >= 0) {
                    this.targets[i].setFill(nextImage);

                }
                //}
            }

            this.currentFrame_ = nextFrame;

            this.lastChangeTime_ -= delay_msec;
            if (delay_msec)
                this.lastChangeTime_ %= delay_msec;
        }
    }

    if (!looping) {
        return nextFrame / this.frames_.length;
    } else {
        return 0;
    }
};