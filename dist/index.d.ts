import * as THREE from 'three';

interface Frame {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    scale: THREE.Vector3;
    quaternion: THREE.Quaternion;
    time: number;
}
declare class InterpolationBuffer {
    state: number;
    buffer: Frame[];
    bufferTime: number;
    time: number;
    mode: number;
    originFrame: any;
    position: Frame['position'];
    quaternion: Frame['quaternion'];
    scale: Frame['scale'];
    constructor(mode?: number, bufferTime?: number);
    hermite(target: Frame['position'], t: number, p1: Frame['position'], p2: Frame['position'], v1: Frame['velocity'], v2: Frame['velocity']): void;
    lerp(target: THREE.Vector3, v1: THREE.Vector3, v2: THREE.Vector3, alpha: number): void;
    slerp(target: THREE.Quaternion, r1: THREE.Quaternion, r2: THREE.Quaternion, alpha: number): void;
    updateOriginFrameToBufferTail(): void;
    appendBuffer(position?: Frame['position'], velocity?: Frame['velocity'], quaternion?: Frame['quaternion'], scale?: Frame['scale']): void;
    setTarget(position: Frame['position'], velocity: Frame['velocity'], quaternion: Frame['quaternion'], scale: Frame['scale']): void;
    setPosition(position: Frame['position'], velocity: Frame['velocity']): void;
    setQuaternion(quaternion: Frame['quaternion']): void;
    setScale(scale: Frame['scale']): void;
    update(delta: number): void;
    getPosition(): THREE.Vector3;
    getQuaternion(): THREE.Quaternion;
    getScale(): THREE.Vector3;
}

export { InterpolationBuffer as default };
