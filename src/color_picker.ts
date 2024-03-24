namespace ColorPicker {
    let gradient_circle: HTMLElement;
    let gradient_wrapper: HTMLElement;
    let hue_circle: HTMLElement;
    let hue_wrapper: HTMLElement;
    let states: [number, number][];
    let current_color: [number, number, number] = [128, 128, 128];
    let background: HTMLElement;

    export function init(): void {
        gradient_circle = document.getElementById("gradient-circle")!;
        gradient_wrapper = document.getElementById("gradient")!;
        hue_circle = document.getElementById("huepicker-circle")!;
        hue_wrapper = document.getElementById("huepicker")!;
        background = document.getElementById("background")!;
        states = [[0, 0], [0, 0]];
        register_circle_hook_gradient();
        register_circle_hook_hue();
    }

    function register_circle_hook_gradient(): void {
        gradient_wrapper.addEventListener("click", (event: MouseEvent ) => {
            const rect = gradient_wrapper.getBoundingClientRect();
            const x = Math.min(Math.max(0, event.clientX - rect.left) / rect.width, 1);
            const y = Math.min(Math.max(0, event.clientY - rect.top) / rect.height, 1);
            states[1] = [x, y];
            gradient_circle.style.left = String(x * rect.width) + "px";
            gradient_circle.style.top = String(y * rect.height) + "px";
            recalculate();
        });
    }

    function register_circle_hook_hue(): void {
        hue_wrapper.addEventListener("click", (event: MouseEvent) => {
            const rect = hue_wrapper.getBoundingClientRect();
            const x = Math.min(Math.max(0, event.clientX - rect.left) / rect.width, 1);
            states[0] = [x, 0];
            hue_circle.style.left = String(x * rect.width) + "px";
            const colors = hue_to_rgb(x);
            gradient_wrapper.style.backgroundColor = "rgb(" + Math.round(colors[0]) + ", " + Math.round(colors[1]) + ", " + Math.round(colors[2]) + ")";
            recalculate();
        });
    }

    function send_colors(): void {
        const r = (current_color[0] < 16 ? "0" : "") + Math.floor(current_color[0]).toString(16);
        const g = (current_color[1] < 16 ? "0" : "") + Math.floor(current_color[1]).toString(16);
        const b = (current_color[2] < 16 ? "0" : "") + Math.floor(current_color[2]).toString(16);
        fetch("https://toaster.zumepro.cz/set.php?hex=" + r + g + b);
    }

    function recalculate(): void {
        const hue_colors = hue_to_rgb(states[0][0]);
        const colors = gradient_coords_to_rgb(states[1], hue_colors);
        current_color = [
            colors[0],
            colors[1] / 4,
            colors[2] / 4,
        ];
        background.style.backgroundColor = "rgb(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ")";
        send_colors();
    }

    function interpolate_channels(a: [number, number, number], b: [number, number, number], percent: number): [number, number, number] {
        return [
            (b[0] - a[0]) * percent + a[0],
            (b[1] - a[1]) * percent + a[1],
            (b[2] - a[2]) * percent + a[2],
        ];
    }

    function gradient_coords_to_rgb(coords: [number, number], current_rgb: [number, number, number]): [number, number, number] {
        const interp_white = interpolate_channels(current_rgb, [255, 255, 255], 1 - coords[0]);
        return interpolate_channels(interp_white, [0, 0, 0], coords[1]);
    }

    function hue_to_rgb(n: number): [number, number, number] {
        const r = (Math.max(.33 - n, 0) + Math.max(.33 - Math.abs(1 - n), 0)) * 3;
        const g = Math.max(.33 - Math.abs(.33 - n), 0) * 3;
        const b = Math.max(.33 - Math.abs(.66 - n), 0) * 3;
        const factor = Math.max(r, g, b);
        return [
            r / factor * 255,
            g / factor * 255,
            b / factor * 255,
        ];
    }
}


export default ColorPicker;
