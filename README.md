Given a Github username and a year, renders a 3D model of their contribution chart. The data is fetched via a serverless function ([repo](https://github.com/martinwoodward/json-contributions) which also calculates distribution data).

```
?username=<username>&year=<year>
```

If no year is provided, the current year will be used.

Examples: 
 - https://skyline.martinwoodward.vercel.app/?username=martinwoodward
 - https://skyline.martinwoodward.vercel.app/?username=martinwoodward&year=2020
 - https://skyline.martinwoodward.vercel.app/?username=mdo&year=2020

#### Development

I've been using `vercel` for local dev. To load up a local server: `vercel dev`.

Note that this version creates a distribution from the 90th percentile on the contributions per day to stop the odd _really_ big days blowing out the scale. It also has a default minimum for non-zero contribition days (10% of the maximum height)


