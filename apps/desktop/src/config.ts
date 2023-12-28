import { writeFile, readTextFile } from "@tauri-apps/api/fs";
import { appConfigDir } from "@tauri-apps/api/path";

export type DirectionLR = "left" | "right" | "center";
export type DirectionTB = "top" | "bottom";

// TODO: this is hard to use we zzz
interface OverlayedConfig {
  clickthrough: boolean;
  horizontal: DirectionLR;
  vertical: DirectionTB;
}

type OverlayedConfigKey = keyof OverlayedConfig;

export const DEFAULT_OVERLAYED_CONFIG: OverlayedConfig = {
  clickthrough: false,
  horizontal: "right",
  // TODO: vertical alignment? i.e., if aligned to bottom, then the navbar should be at the bottom (and corner radius changes appropriately)
  vertical: "bottom",
};

export class Config {
  private config: OverlayedConfig = DEFAULT_OVERLAYED_CONFIG;
  private configPath: string = "";
  constructor() {
    this.init();
  }

  init = async () => {
    this.configPath = `${await appConfigDir()}config.json`;

    try {
      const config = await readTextFile(this.configPath);
      this.config = JSON.parse(config);
    } catch (e) {
      this.config = DEFAULT_OVERLAYED_CONFIG;
      this.save();
    }
  };

  getConfig(): OverlayedConfig {
    return this.config;
  }

  get(key: OverlayedConfigKey): any | null {
    return this.config[key] || null;
  }

  set<K extends keyof OverlayedConfig>(key: K, value: OverlayedConfig[K]): void {
    this.config[key] = value;
    this.save();
  }

  async save() {
    await writeFile({
      path: this.configPath,
      contents: JSON.stringify(this.config, null, 2),
    });
  }
}

export default new Config();
