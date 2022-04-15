pragma solidity ^0.5.0;

contract SocialNetwork{

    string public name;
    uint public postCount = 0;

    mapping(uint=>Post) public posts;

    struct Post{
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }
    
    
    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );
    
    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    constructor()public{
        name = "Dapp Social Network";
    }

    function createPost(string memory _content) public{

        // require valid contract
        require(bytes(_content).length >0);

        postCount++;

        posts[postCount] = Post(postCount,_content,0,msg.sender);

        // Trigger event
        emit PostCreated(postCount,_content,0,msg.sender);
        
        
    }

    function tipPost(uint _id) public payable {
        
        
        require(_id>0 && _id<=postCount);
        
        
        //fetch the post
        Post memory _post = posts[_id];
        
        //fetch the author
        address payable _author = _post.author;
        
        //pay the author by sending them ether
        address(_author).transfer(msg.value);
        
        //increment the tip amount
        _post.tipAmount+= msg.value;  //msg.value is the value req to call the func and this is send as tip
        
        //update the post
        posts[_id] = _post;
        
        // Trigger an event
        emit PostTipped(_id,_post.content,msg.value,_author);
    }

    
}