import xwinLogo from '../assets/xwin-logo.png'

export function LogoWordmark({ size = 40 }: { size?: number }) {
  return <img src={xwinLogo} alt="XWIN" style={{ height: size, width: 'auto' }} />
}
