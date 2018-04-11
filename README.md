# RPC-Example
### A demo of Remote Procedure Call(RPC) between NodeJs Servers
The setup is assuming that a client server cannot perform computations that are requested of it and thus are forwarding the 
request to the master server. The master server has a vertain number of slave servers who will perform the computation and 
the processed output will be returned to the requesting client.
