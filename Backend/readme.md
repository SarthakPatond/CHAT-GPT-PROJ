//! Timeline , order of work greater time complexity

1. user msg save in db
2. generate vector for user msg
3. query pinecone for related memories
4. save user msg in pine cone 
5. get chat history from db (mongodb )
6. generate response from ai with help of stm and ltm
7. save ai response in db
8. generate vector for ai response 
9. save ai msg in pinecone 
10. send ai response to user


\\ now 

    user msg save in db   |  generate vector for user msg      |   save user msg in pine cone 


    query pinecone for related memories   |   get chat history from db (mongodb )


    generate vector for ai response 


    send ai response to user


    save ai response in db       |     generate vector for ai response 



     save ai msg in pinecone 













