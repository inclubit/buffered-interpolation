// src/index.ts
import * as THREE from "three";
var INITIALIZING = 0;
var BUFFERING = 1;
var PLAYING = 2;
var MODE_LERP = 0;
var MODE_HERMITE = 1;
var framePool = [];
var getPooledFrame = () => {
  let frame = framePool.pop();
  if (!frame) {
    frame = { position: new THREE.Vector3(), velocity: new THREE.Vector3(), scale: new THREE.Vector3(), quaternion: new THREE.Quaternion(), time: 0 };
  }
  return frame;
};
var freeFrame = (f) => framePool.push(f);
var InterpolationBuffer = class {
  constructor(mode = MODE_LERP, bufferTime = 0.15) {
    this.state = INITIALIZING;
    this.buffer = [];
    this.bufferTime = bufferTime * 1e3;
    this.time = 0;
    this.mode = mode;
    this.originFrame = getPooledFrame();
    this.position = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
    this.scale = new THREE.Vector3(1, 1, 1);
  }
  hermite(target, t, p1, p2, v1, v2) {
    const t2 = t * t;
    const t3 = t * t * t;
    const a = 2 * t3 - 3 * t2 + 1;
    const b = -2 * t3 + 3 * t2;
    const c = t3 - 2 * t2 + t;
    const d = t3 - t2;
    target.copy(p1.multiplyScalar(a));
    target.add(p2.multiplyScalar(b));
    target.add(v1.multiplyScalar(c));
    target.add(v2.multiplyScalar(d));
  }
  lerp(target, v1, v2, alpha) {
    target.lerpVectors(v1, v2, alpha);
  }
  slerp(target, r1, r2, alpha) {
    target.slerpQuaternions(r1, r2, alpha);
  }
  updateOriginFrameToBufferTail() {
    freeFrame(this.originFrame);
    this.originFrame = this.buffer.shift();
  }
  appendBuffer(position, velocity, quaternion, scale) {
    const tail = this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : null;
    if (tail && tail.time === this.time) {
      if (position) {
        tail.position.copy(position);
      }
      if (velocity) {
        tail.velocity.copy(velocity);
      }
      if (quaternion) {
        tail.quaternion.copy(quaternion);
      }
      if (scale) {
        tail.scale.copy(scale);
      }
    } else {
      const priorFrame = tail || this.originFrame;
      const newFrame = getPooledFrame();
      newFrame.position.copy(position || priorFrame.position);
      newFrame.velocity.copy(velocity || priorFrame.velocity);
      newFrame.quaternion.copy(quaternion || priorFrame.quaternion);
      newFrame.scale.copy(scale || priorFrame.scale);
      newFrame.time = this.time;
      this.buffer.push(newFrame);
    }
  }
  setTarget(position, velocity, quaternion, scale) {
    this.appendBuffer(position, velocity, quaternion, scale);
  }
  setPosition(position, velocity) {
    this.appendBuffer(position, velocity, void 0, void 0);
  }
  setQuaternion(quaternion) {
    this.appendBuffer(void 0, void 0, quaternion, void 0);
  }
  setScale(scale) {
    this.appendBuffer(void 0, void 0, void 0, scale);
  }
  update(delta) {
    if (this.state === INITIALIZING) {
      if (this.buffer.length > 0) {
        this.updateOriginFrameToBufferTail();
        this.position.copy(this.originFrame.position);
        this.quaternion.copy(this.originFrame.quaternion);
        this.scale.copy(this.originFrame.scale);
        this.state = BUFFERING;
      }
    }
    if (this.state === BUFFERING) {
      if (this.buffer.length > 0 && this.time > this.bufferTime) {
        this.state = PLAYING;
      }
    }
    if (this.state === PLAYING) {
      const mark = this.time - this.bufferTime;
      while (this.buffer.length > 0 && mark > this.buffer[0].time) {
        if (this.buffer.length > 1) {
          this.updateOriginFrameToBufferTail();
        } else {
          this.originFrame.position.copy(this.buffer[0].position);
          this.originFrame.velocity.copy(this.buffer[0].velocity);
          this.originFrame.quaternion.copy(this.buffer[0].quaternion);
          this.originFrame.scale.copy(this.buffer[0].scale);
          this.originFrame.time = this.buffer[0].time;
          this.buffer[0].time = this.time + delta;
        }
      }
      if (this.buffer.length > 0 && this.buffer[0].time > 0) {
        const targetFrame = this.buffer[0];
        const delta_time = targetFrame.time - this.originFrame.time;
        const alpha = (mark - this.originFrame.time) / delta_time;
        if (this.mode === MODE_LERP) {
          this.lerp(this.position, this.originFrame.position, targetFrame.position, alpha);
        } else if (this.mode === MODE_HERMITE) {
          this.hermite(
            this.position,
            alpha,
            this.originFrame.position,
            targetFrame.position,
            this.originFrame.velocity.multiplyScalar(delta_time),
            targetFrame.velocity.multiplyScalar(delta_time)
          );
        }
        this.slerp(this.quaternion, this.originFrame.quaternion, targetFrame.quaternion, alpha);
        this.lerp(this.scale, this.originFrame.scale, targetFrame.scale, alpha);
      }
    }
    if (this.state !== INITIALIZING) {
      this.time += delta;
    }
  }
  getPosition() {
    return this.position;
  }
  getQuaternion() {
    return this.quaternion;
  }
  getScale() {
    return this.scale;
  }
};
export {
  InterpolationBuffer as default
};
