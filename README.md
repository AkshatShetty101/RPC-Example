# RPC-Example
### A demo of Remote Procedure Call(RPC) between NodeJs Servers
The setup is assuming that a client server cannot perform computations that are requested of it and thus are forwarding the 
request to the master server. The master server has a certain number of slave servers who will perform the computation and 
the processed output will be returned to the requesting client.

### Client: 
For the demo there is only provision of one client system runnin its server at port 3000. It can make a request to the master server to carry out computations on 2 parameters passed. The post request passed at localhost:3000 should be like
```
{
  "a":121 // Or some other number
  "b":12 // Or some other number
}
````

### Master Server:
For the demo purposes the master server has a socket open at port 9389. The master Server recieves requests from the client servers and then polls the slave servers setup at port 4000,5000,6000 for their status with respect to thier active load. It does take into consideration if suddenly a slave server goes down and distributes the requests based on load.


The master returns the url at which the client can obtain the result of its computation.
eg:-
```
localhost:4001?id=4532069f-9e1c-4cec-b6e2-40004f225664
```

### Slave Server:
The slave servers respond to the master's polling with the active load it is under. 

The status of the slave server can be checked at:
```
localhost:4001/status | localhost:5001/status | localhost:6001/status

```
