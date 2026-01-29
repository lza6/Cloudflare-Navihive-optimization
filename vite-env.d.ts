declare module '@tailwindcss/vite' {
    import { Plugin } from 'vite';
    function tailwindcss(): Plugin;
    export default tailwindcss;
}
