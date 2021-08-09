<pre align=center><h2><b>Huge shoutout to <a href=https://github.com/ekmand>Ekmand</a> for sponsering this project by buying a domain for it!</b></h2></pre>

<br><hr>

<h1 align=center>⚡ OnDrop ⚡</h1>
<hr>
<div align=center><img src=https://user-images.githubusercontent.com/61319150/128249920-2ce97495-1f5d-41df-b439-82e96c3c2db1.gif></div><br>
<div align=center><i>A lightning fast, simple and easy alternative to airdrop!</i></div>
<hr>

## Features:

- ✔️ Simple to use
- ⚡ Quick
- 🔥 Supports any device
- 🚀 Easy
- 🚫 No tracking or storing of data for more than 5 minutes.
  - This uses your IP adress as the key to find people nearby you on the app, in no way is this logged anywhere, stored, or sent to other users.
  - No analytics, no long term storage, no data sharing.
- 😎 Looks good!
- 🌔 Dark mode

<small><i>Name by [Jeffalo](https://github.com/jeffalo)</i></small>

## Stuff that will be added soon:

- [x] <mark>END TO END ENCRYPTION!!!</mark>
- [x] Only public keys sent, files encrypted in chunks.
- [ ] Minified and self-hosted libraries (no more `<script>` and `<link>` tags)
- [x] Support for pasting images (`Control + V`)
- [ ] Browser extension?
- [ ] UI support for custom keys instead of IP adresses. (Allows you to connect with someone with a different IP adress than you. Currently it's `?ip=[anything_here]` in the URL.

# What people are saying about ondrop:

![image](https://user-images.githubusercontent.com/61319150/128539453-6e503ebf-bd26-44c7-bdce-ee4710684717.png)
![image](https://user-images.githubusercontent.com/61319150/128539928-662bf0b5-e3e1-453d-b49b-77a2ddfbf13e.png)
![image](https://user-images.githubusercontent.com/61319150/128540231-9effe93b-b6b9-43f2-b642-3a7e9a3cc637.png)
![image](https://user-images.githubusercontent.com/61319150/128540309-69669f7d-4a4f-40ee-91e0-09826a959ba5.png)

# FAQ

(Not actually asked frequently, this is just stuff that people may ask if they ever see this project and are interested in it :weary:)

## Why should I use this over other services?

- This doesn't track you, it's easy, you can share between platforms (Airdrop only works on macs & iPhones :computer:).
- Most other services track you somehow.

## How does OnDrop work?

OnDrop uses your [IP address](https://www.dummies.com/computers/pcs/what-is-an-ip-address/) to put you into a [room](https://socket.io/docs/v3/rooms/index.html) using [socket.io](https://socket.io). To send files in realtime it sends the file as a [blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to a certain person. This file is then received by that person. All connections are hidden from IP addresses outside of the current group. To view the full code that I wrote see [`index.js`](https://github.com/Explosion-Scratch/ondrop/blob/master/index.js).

## Does OnDrop track you?

Absolutely not! All files are deleted after 5 minutes, and whenever I run the server. IP addresses are not tracked in any way, they are only used as a grouping tool to group people together.

## How'd you get that epic name?

![image](https://user-images.githubusercontent.com/61319150/128540633-293484a4-91ef-4e2b-bece-efa0f941f48c.png)

## Wowww, I love those shadows and stuff you did

Thanks! That's a style called [neomorphism](https://uxdesign.cc/neumorphism-in-user-interfaces-b47cef3bf3a6), which is a super cool way to make stuff look realistic and pleasant using CSS.

## All these other people you show are contacting you on discord and I feel left out

`--Explosion--#0001` :smile:

## How did you come up with this idea?

![Roll Safe, the Guy-Tapping-Head Meme](https://pyxis.nymag.com/v1/imgs/d6a/dc7/4a5001b7beea096457f480c8808572428b-09-roll-safe.2x.rsocial.w600.jpg)
Came to me when I realized that multiple people can have the same IP address, therefore it'd be possible to group them and figure out who's near whom.

## Can I use your code?

It's open source, so sure, but give credit :neutral_face:

## Tips and tricks! Gimme some!

- You can click on a user to share a file with them.
- You can create a unique link to share with someone if they don't live nearby or aren't on the same wifi network by using the `ip` query parameter, (like this: `https://ondrop.explosionscratc.repl.co/?ip=test`, now if the person you send it to goes to that link you'll be able to connect)
- You can paste anything and it'll upload it to everyone, an image, some text, etc!
- You can drag and drop not just files, but images and text from webpages as well!
- Now installable as a PWA!
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE1MDcwODg3NjYsLTExNTQwMDYwNzMsLT
I5MTIwOTM5LC0xMTcxNjEzNDE3LC0xMDIwODU2NTk1LC0xODE2
NzA3Mjk0LC0yMTEzNTg4MjI3LDEyOTMyMjQ3MDMsLTU1NDkxMT
g4Ml19
-->