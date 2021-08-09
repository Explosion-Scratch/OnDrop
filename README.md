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

![image](https://user-images.githubusercontent.com/61319150/128779150-01b5c5ce-79d9-4fc5-be09-c2e2a3b8c927.png)
<br>
(Thank you thank you thank you!!! :heart:)

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
<hr>
<div align=right><i>

[OnDrop](https://github.com/explosion-scratch/ondrop) © 2021 by [Explosion-Scratch](https://github.com/explosion-scratch) is licensed under [CC BY-NC-SA 4.0 ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAbrAAAG6wFMMZ5KAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAxxJREFUSIm11luIVlUUB/DfzKhTwQQW2nQhiHwJAiOYyKjEKGhSoyCyh4QIulHQjSBf6sGp6AKVURBERUlJBBH1EPSQhVA9dBG6aPegtBG6TdNUjs7Xw97Hs77t+Zzv0/EPh3PO3v+9/nuvtfdau093OBIrsBpLcRyG0cIvGMeneBOb8U+XdjtiGI9jMot080ziCZxwsKJr8UeD4b/wJd6VVvcFJhp4E7iuF8E+3F8Y+ROP4HzMaxgzgHPxcMNkn8L8bkRfDINm8CQW9TDxY/Eo9gY7b80mfm8g/4urexAsMap99c92Il4mrbCF/7D8EEQrnKE9/teXhCPwYyD0tClmwSj2ZLu/Y2HsvD2IvjSHohU2BPtjVeOAlAQqF59yGIQXq10+gcF5WCZlItiI74tBi3ANTscUPsImKVFUOBNrpKSxS9rFb4f+XdLmuhVD8v55SO2G0UJ0GX61f3L4BksyZ516U8ZnE/qDrRWh7zFSBmrhbwwG4lHYoU6D9+Au/JyF1uPCYGwrbpLiuUdy6dnB3nx16t0CX+Wf7cVqrwpGbwvtSzGSv1/J/dM4KXAu1Zx0tmf+16Tc28I7BWl9EB7RjM/Vru8GmzN/MsagryC1wne/ZrRm6S9Racz0Y2f+Ob4gRddfEL5PxLVSsdiW207GqYGzSnt8KyzO73F4L898SspgFYakY1Dl7THcgM9y29NYqQ7HNtws5fup3HZRsDegPstbSKWsGryymOFyKc2VR+UD9ea5r6F/RiqtEeeE/g1wXmh4roN77sTzUolcY/8SN4IH8AIelBJKiVjjL65cMJ4bdqsTw1xiIX5T32D2hfSOMJtXD4NwDGdbCBbg29B5yxyKlmXxmJKwSn1dmc7/h4qztF8EbuxEXBdI01I1OVisle7Xlb2NByL34RntR+N1nNaD4BKpMkUbr0nhnBV3a78lTuNlXImjG/hDuEJa1W7t53lM9ykVXILvipm38oR24hN8LJXOvQ28H3B5L4IRC6SSWF2Nunl25DGDDfb2oaxInTAg3UZWS8l/WCoWLfyUJ/Y+3sCHkosPiP8Btp0swL9OhkEAAAAASUVORK5CYII=)![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAbrAAAG6wFMMZ5KAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAArlJREFUSIm11k9oHVUUBvBfX2Ka11TbGkhaWwPu3FmoQiBBsXShNEEEC9KFkIVIN64sKAUXhVaolJZIIkZB6ap0kYUKpSstrbpw4UJqu1RjSlOMljTEpK2NizvDu5k3M5kXkw8uM9z7nfPdc/+cezaphjr2YwjPoBc7sYxbmMENfIMvMVfRbyG24wPMJyJV2gLGsWetoiOYzXE8j+u4jG/xixBhHu9IK4JtOJNxMofTeAHtBTaDOIW/M7af4JHVRGuYjIweCsvW08LEu5OJ/xv5ubSa+KmI/A9eL+A9i8+Ttq+AM2zlFnxcJHo4Ii0Ky5qHTbgZcaeTvjzszYi/lSVsFa5FShgpmh0e03yQHi3hD2ss+xx2x4PvR07OlThJcS3i/1yBHx/Wj9LODtzRuINPVnDUg7eTVuXgdUca86i3C3u5LSF8gakSB8fxdKZvMPn+JCSbPMziU7yDLrwIoxrLcKBEtK55b7OtXmL/fMQbg6saS9BRYthVQbirxL4ddxPedzXsSgamcK/E8P/igXD1oLcmvDSE67TRSDV21oTQKU4C64lUY7kmvKWE93Wjka7uTE0j/D3KE/mSkPImcsYmkrGlEvs2PJH834azql2nFIc0n+ZDFewGIv54DV9Hg69WcLBWDEf/Fwl39y+Np7BvFQdrifjxSGMBW2rC3f0wIXTiZNUQWsAx7Ej+xxJxhFT3u0YEZbVSqxEfFJLHslAWdWcJr2i8m/fw8joID1hZob5ZNLtjEem+/Mj7cSHT+nN4bwhnJvU3WiRKyCyfZaI5j6fKjDLoE4qJ2Mek/Oq0SfxdK6vEReE9PSj/6duMl4RSNo7yIU4I1WtlDOE3zfu5mPT/gO/xa0YsbX/gtVYEY3TiKP7McVzUZvEetpQ5rvoitQsVxBCeE5J9mnenhdz7I77CFeH6lOI/baALunnzplQAAAAASUVORK5CYII=)![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAbrAAAG6wFMMZ5KAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAxRJREFUSIml1luoZ3MUB/DPueaMQ0PkKLc8eOWBooTIA2eGkii8jHKb4kGMePCiyWAkU2Z4QEnydMp40ESMa4ohI3XSKJcZuR3jcsxw5jh/D2vv8//tfX577/+MVb/6//de67vWXr/vugwZTCZwKdbgbJyEKfTwA37ELN7CdvwxIG6jrMbDmC+cDHIOYCtOOVKn6zCXAZ7DbuzAa/gMP2f05nHH4TgcwRM1kN+wCedjOGMzhPPwEH6p2T6DsS6nw5hJjJbwJE44jMBX4xEsJjg7upw/migfxHUtulM4Uz4DcCV+T/CebgK6IVH6Gxe1RYhXCt3JFp1zBMNL3BV3PinKolRY1+F0UMcwrZ/2P9XY/mDi9Fdcj9EMyDCuwcuFXg/v4HFR302yOcF/qnw4LlhbL4evcTeOLfRGCodN9buEexocH58E+pdoSC5vAesJgmzGhtrzb/BuAvg5Tmz56k2J7TRsqT3YgO86gnk+ARzHraKNtsmFif1WeE//4staGxMs/7jB8SyuFekfVEYKHz28D3uKP7sbDC4Rjf/fTABf4S7dzC5ltrDbI4nizQ6js0SKcgNjv2g+p3Zg7NTP7rLjnQNGfRzuw95MAAt4Cec22L6uP0CWUz07oONSxnETPs0E0MPbuFq1pe7Sv6Jlcs3rniI5Mh0jf//l+RLrBQ/K7H5AdQRe1uJ0leDBNtV6vSCxX8Jz8jxIB8Y2YqVZ0c5qMoE3Er1DIsUfFr/T8Uc7D3pYS6S33DQO4rSM41FsxD8NQD18YWUTGcON+CTRO1BkD9V2+GLDV8PpeEBMpnLTmMFtgmxNkg6Jx9IXE/g2eXl7C0gp2wvdozv0rtAfi/vFwKjIGn12LhQG/9fxxapEu6VJMU35IdzZAjopSDTU8P5mVU5sacFCUD0lzYxol4PKGaJ71TFyi8UKuVe1KSzgBbF95AbCKlyFZ8W+ltb1Rs0LYVamxbCvl80ivhd1vAv7VFfZ8uwVo/OI5Chx7/Ulve3M4X5JreakiRh1GRXr7loxeaZwcvFuH37CR3hVrEOLXYD/AYTjaOgDscSLAAAAAElFTkSuQmCC)![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAbrAAAG6wFMMZ5KAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAyJJREFUSIml102IVWUYB/DfjLdxtKgoaaJEqGhRBC6qRUyJWUGJghQVQrWQCloUtGgRJYiK0NCHfRlSUUQL97ZoETRJFkRFq6IWJpLWaGTaqH1MMy2ec7zvee97rnfsDy/3nPM+z/O/z3uerzNkMIziVqzFclxarTn8gil8gw8wiVMD2m3F+diC4xXJIOsPbMOFZ0v6AA4XDE/jO3wivPu25Y/9ig3zIRzGcwUvXsJKdAo6C3AzJvB7pvtKi04P6a5EaRY7xfscFBdjO/5N7Ow+E/nWRPgvPDQPwhyrcUzT8yLuFR7O4W/c9j9Ia9woXlNN/nAucC4OJQKPtBi6BM/iY+zD9yLINuHKFp11usd+DJelm88kpO/3MXBUb/Smr2Yzhgq62xWOfCQxeArLCop34p8+pOl6q6C/RDfap7EIbk+U3igojeBAIjMrIv8+EQdP4OeM/MGCnYlkfzW8nDy4o6BwT2b0hYLM1TiRyOzTmz63JPuvw6fJEYxkwpfjnYx4pcj3HDsyuRXZfkc3wvcO6xaHn0QapbgG92fPxsVx5/i8IJdiBger6zHC0zmRIiWsSGQ2tsjAKk2PXy3ITFZ7053qgnIawB6RSteLGt6Gmex+YR9ZHdFLz9O/Hn9UrX7I0/BIQWas+p3qiEZ+FZbiHJGvKR7Hdcn9kzhZMHpDdv9Vdr9ABCvhbCOdVhUM5i3yrhZP0qp2HBdkMuPJ/g6aBeS1gtHlGfF+UTjqlLoWX2cyW8/gwBoid3+rHpwUR57j3cxwXZunCs+/0BtYF+meyAksrjeeThTfKxAvwocFknxNikEgx4uJzES6sVgUkHrz0YLyMB7DDxnZrDjqDSKActyt2xaPVt43sE5zECgFUY2luEm8/yV95MY1a3jJIUSTr4VmROc5W6wXMdOvXZ7GEN7WPMpduGIehMtEnKQ2dosa0RdDItjSKfFPvCn66GhBZ6EYFnaKYSIlfV753bdireYAkP6J/fgMe/FjgWxODAfr50OYYhRPia+CQcaeOnI3igGyFW0dKUdHtMc1YmQd050WD4pPnS/FR9sevfW+B/8BZJpLptZR4EgAAAAASUVORK5CYII=)](http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1)

</i></div>

<!--stackedit_data:
eyJoaXN0b3J5IjpbNzYyNTk3NDUzLC01NjA5MDY4NTksOTQ4Mj
IxNDk1LC0xMTU0MDA2MDczLC0yOTEyMDkzOSwtMTE3MTYxMzQx
NywtMTAyMDg1NjU5NSwtMTgxNjcwNzI5NCwtMjExMzU4ODIyNy
wxMjkzMjI0NzAzLC01NTQ5MTE4ODJdfQ==
-->
