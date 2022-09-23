# Vodafone Restart Router Script

script for the Vodafone EasyBox to restart the router over their User Interface

## Usage

`node index.js -u [user] -p [password] (-r [retries])`

## Why?

I don't have physical access to the router itself since I'm just having my own router (fritz!box is so much better,
never use Vodafone routers if you can avoid it) connected to the main router.

Now the router was having his regular hiccups and giving me an incredible 74% packet loss.
So I log in on the user interface (after several "incorrect password" attempts since the timeout for login requests is
30 seconds).

Navigating to the restart menu alone contains multiple redirects (login -> home -> status -> restart). You can imagine
that with 74% packet loss it'll take you multiple minutes to even get to the page...

But now the genius Vodafone developers had a great idea. We send the restart request exactly once without ever
validating the success of the request.
But that's not all. After a fake progress bar reaches 100% we simply spam the logout request (which would honestly be
fine if they would've validated the restart request status code).
With the 74% packet loss and insane latency it simply dropped my request multiple times and simply logged me out without
doing ANYTHING. It also happened that the restart request only reached the router after it already logged me out again
resulting in an unauthorized status....

After it took me 2(!) hours to simply restart the router I started writing this script to now actually check for the
restart request status code and retrying else.
