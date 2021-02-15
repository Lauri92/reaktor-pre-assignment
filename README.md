# Broken API task

The idea of the solution is that data is fetched from the broken API in the node.js back end and saved into cache by
using "
node-cache" where it is quickly available for fetching for the client side. The client can then fetch a certain product
category after the cache is updated into back end. Upon launching the website the text will indicate if the backend is
still updating the cache, once it is updated buttons appear which point to backend to request a certain product
category. The backend frequently checks if the data stored in cache is recent enough, if not the cache will be updated.
There is only 1 website and user can switch the categories by clicking buttons.
