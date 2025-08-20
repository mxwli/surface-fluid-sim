
import { createRoot } from 'react-dom/client'

import { useEffect, useState } from 'react';

import { gridToImage } from '../util';

const width = 100;
const height = 90;

function Sand() {
    const [frame, setFrame] = useState(0);
    useEffect(() => {
        const int = setInterval(() => {
            setFrame((prevFrame) => prevFrame + 1);
            clearInterval(int);
        }, 1000 / 60); // 60 FPS
    }, [frame]);

    const [grid, setGrid] = useState<number[][]>([]);

    useEffect(() => {
        const newGrid: number[][] = Array.from({ length: height }, () => Array(width).fill(0));
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                newGrid[y][x] = Math.floor(Math.random() * 1000);
            }
        }
        setGrid(newGrid);
    }, []);

    useEffect(() => {
        if (grid.length === 0) return;
        const newGrid: number[][] = Array.from({ length: height }, () => Array(width).fill(0));
        let dirs: number[][] = [];
        // build dirs
        let wb = (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                newGrid[y][x] = grid[y][x];
                for (let d of dirs) {
                    let nx = x + d[0];
                    let ny = y + d[1];
                    if (!wb(nx, ny)) continue;
                    if (grid[ny][nx] + 5 < grid[y][x])
                        newGrid[y][x]--;
                    if (grid[ny][nx] - 5 > grid[y][x])
                        newGrid[y][x]++;
                }
            }
        }
        setGrid(newGrid);

        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            gridToImage(grid, 100, 90, ctx);
        }
    }, [frame]);

    return <canvas width={1000} height={900}
        id="canvas"></canvas>
}

createRoot(document.getElementById('root')!).render(
    <>
        <Sand />
    </>
)
