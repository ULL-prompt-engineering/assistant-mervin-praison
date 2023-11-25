## References

See Youtube video <a href="https://youtu.be/CPlwcY5mQ_4?si=2OuCr5k_ztRoZfOL" target="_blank">OpenAI Assistants API + Node.js 🚀 How to get Started?</a> 
by Mervin Praison and the [blog post](https://mer.vin/2023/11/openai-assistants-api-in-node-js/). This was the starting point for this repo.

## Run lifecycle

![](https://cdn.openai.com/API/docs/images/diagram-1.png)

In order to keep the status of your run up to date, you will have to periodically [retrieve the Run object](https://platform.openai.com/docs/api-reference/runs/getRun). You can check the `status` of the run each time you retrieve the object to determine what your application should do next. 


We plan to add support for streaming to make this simpler in the near future.