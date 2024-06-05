import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config({ path: process.env.ENV_FILE ?? '.env' })

export default ({ mode }: {mode: string}) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
};
// export default defineConfig({
// https://vitejs.dev/config/
//   process.env = {...process.env, ...loadEnv(mode, process.cwd())};
//   return defineConfig({
//     plugins: [react()]
//   }); 

 