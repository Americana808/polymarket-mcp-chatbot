declare module "playwright-aws-lambda" {
  export function launchChromium(...args: any[]): Promise<any>;
  export function loadFont(url: string): Promise<void>;
}
