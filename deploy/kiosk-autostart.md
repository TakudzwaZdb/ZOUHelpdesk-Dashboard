# Kiosk PC setup — full-screen, auto-launch on boot (Control #4)

Goal: the display PC in Student Affairs boots straight into the dashboard,
full-screen, with no login and no further interaction.

## Windows (Chrome/Edge)

1. Create a shortcut with this target (adjust URL/token/path):
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 "https://helpdesk-dashboard.zou.ac.zw/?token=YOUR_KIOSK_TOKEN"
   ```
2. Put the shortcut in:
   `C:\Users\<kiosk-user>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`
3. Set the kiosk PC to auto-login as a dedicated low-privilege local account
   (Settings → Accounts → Sign-in options → disable password requirement,
   or use `netplwiz` to enable auto-logon for that one account).
4. Disable Windows Update reboots at odd hours / screen sleep & lock:
   `powercfg /change monitor-timeout-ac 0`, and disable the screensaver.
5. Press `Esc` then `Alt+F4` is how staff can exit kiosk mode if ever needed
   (only from the physical console, not remotely).

## Linux (Chromium, e.g. on a lightweight kiosk box)

1. Install a minimal window manager (e.g. `openbox`) and Chromium.
2. Autostart file `~/.config/openbox/autostart`:
   ```
   xset s off
   xset -dpms
   chromium-browser --kiosk --incognito --noerrdialogs --disable-translate \
     --no-first-run --autoplay-policy=no-user-gesture-required \
     "https://helpdesk-dashboard.zou.ac.zw/?token=YOUR_KIOSK_TOKEN" &
   ```
3. Enable auto-login to that account via your display manager (e.g. `lightdm`
   `autologin-user=kiosk` in `/etc/lightdm/lightdm.conf`).
4. Optional watchdog: a systemd `--user` service or cron `@reboot` line that
   restarts Chromium if it crashes.

## Recommended combination for Monday

- Control #1 (network/VLAN allowlist) **and** Control #3 (kiosk token in the
  URL) together — the token means even someone on the VLAN can't casually
  screenshot the raw API without the link, and the VLAN restriction means
  the token alone isn't enough from off-campus.
- The dashboard already shows aggregates only (Control #2 is satisfied by
  design — see README "What the dashboard deliberately does not show").
- Control #4 (kiosk full-screen autostart) for the actual presentation PC.
