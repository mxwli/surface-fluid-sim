import { useEffect, useState } from 'react';

export function gridToImage(grid : number[][], width: number, height: number, ctx: CanvasRenderingContext2D, scale:number = 10) {
    ctx.save();
    ctx.scale(scale, scale);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = grid[y][x] * .255;
            ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    ctx.restore();
}
