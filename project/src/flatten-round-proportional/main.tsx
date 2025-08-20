
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
    const [tot, setTotal] = useState(0); // sum of grid
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // mouse position
    const [curVal, setCurVal] = useState(0); // value at mouse position
    const [mouseDown, setMouseDown] = useState(false); // mouse down state
    const [threshold, setThreshold] = useState(20); // threshold for grid adjustment
    const [flowRate, setFlowRate] = useState(0.01);

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
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 2) continue;
                dirs.push([dx, dy, dist]);
            }
        }
        let wb = (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                newGrid[y][x] = grid[y][x];
                for (let d of dirs) {
                    let nx = x + d[0];
                    let ny = y + d[1];
                    if (!wb(nx, ny)) continue;
                    let diff = 0;
                    if (grid[ny][nx] + threshold*d[2] < grid[y][x])
                        diff = grid[ny][nx] + threshold * d[2] - grid[y][x];
                    if (grid[ny][nx] - threshold*d[2] > grid[y][x])
                        diff = grid[ny][nx] - threshold * d[2] - grid[y][x];
                    if (diff != 0) {
                        newGrid[y][x] += diff * flowRate;
                    }
                }
            }
        }
        if (mouseDown) {
            for (let i = -2; i <= 2; i++) {
                for (let j = -2; j <= 2; j++) {
                    const nx = mousePos.x + i;
                    const ny = mousePos.y + j;
                    if (wb(nx, ny)) {
                        newGrid[ny][nx] -= 50;
                    }
                }
            }
        }
        setCurVal(newGrid[mousePos.y][mousePos.x]);
        setTotal(newGrid.reduce((acc, row) => acc + row.reduce((sum, val) => sum + val, 0), 0));
        setGrid(newGrid);

        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            gridToImage(grid, 100, 90, ctx);
        }
    }, [frame]);

    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / (rect.width / width));
        const y = Math.floor((e.clientY - rect.top) / (rect.height / height));
        setMousePos({ x, y });
        setMouseDown(true);
    }

    function handleMouseUp() {
        setMouseDown(false);
    }

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / (rect.width / width));
        const y = Math.floor((e.clientY - rect.top) / (rect.height / height));
        setMousePos({ x, y });
    }

    return <>
            <canvas width={1000} height={900} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove} id="canvas"></canvas>
            <div style={{marginTop: 20}}>Total: {tot}</div>
            <div>Current: {curVal}</div>
            <div>
                <div>Threshold: {threshold}</div>
                <input type="range" min="0" max="40" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
                <div>Flow rate: {flowRate}</div>
                <input type="range" min="0" max="0.04" step="0.01" value={flowRate} onChange={(e) => setFlowRate(Number(e.target.value))} />
            </div>
            <div>
                <p>Still reasonably inexpensive, but extreme values are still slowly propagated</p>
                <p>No longer creates "concentric square" artifacts</p>
                <p>Effect distance is still (probably) about value / threshold</p>
            </div>
        </>
}

createRoot(document.getElementById('root')!).render(
    <>
        <Sand />
    </>
)
