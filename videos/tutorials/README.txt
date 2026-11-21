BELLVER CARD VIDEOS: NOW ON CLOUDFLARE (moved 21 Nov 2026)

The MP4 files no longer live in this repository. GitHub Pages allows a published
site of 1 GB and the videos were 850 MB of it. Do not upload MP4s here again.

Every video plays from https://media.bellveraffiliates.com/ with the same path as
before, for example:
  https://media.bellveraffiliates.com/videos/tutorials/01-register-your-bellver-card-account.mp4
Download buttons use the download copy, with download/ in front of the same path:
  https://media.bellveraffiliates.com/download/videos/tutorials/01-register-your-bellver-card-account.mp4

To add or update a video: upload both copies to Cloudflare (the play copy and the
download copy), then point the player's data-src and the Download button at them.
When a video changes, change the ?v= on its data-src so browsers fetch the new file.
The "Coming soon" tile trick (data-wait) only checks this site, so give a new tile
its data-src directly instead.

Tutorials (all on Cloudflare):
01-register-your-bellver-card-account.mp4   (live, 9 Oct 2026)
02-log-in-and-secure-your-account.mp4       (live, 9 Oct 2026)
03-web3-wallet-and-private-key.mp4          (live, 10 Oct 2026)
04-fund-your-wallet-and-order-your-card.mp4 (live, 10 Oct 2026)
05-bellver-dashboard-walkthrough.mp4        (live, 15 Oct 2026)
06-top-up-your-bellver-card.mp4             (live, 17 Oct 2026)
07-request-a-withdrawal.mp4                 (live, 16 Nov 2026, 4:32; Dr RaShon's
                                             copy uses HER voice)

Every video opens on its own thumbnail for the first second (17 Oct 2026),
so shared files show the thumbnail instead of a black first frame.
New videos: run the same thumbnail opener before uploading.
