const Link = ReactRouterDOM.Link;
const Route = ReactRouterDOM.Route;
const HashRouter = ReactRouterDOM.HashRouter;
const BrowserRouter = ReactRouterDOM.BrowserRouter;
const Switch  = ReactRouterDOM.Switch;

const useHistory = ReactRouter.useHistory;
const useLocation = ReactRouter.useLocation;
const useParams = ReactRouter.useParams;


// -----------------------------------------------------
// functions
// -----------------------------------------------------

const useQuery = (endpoint) => {
    return new URLSearchParams(new URL(endpoint).search);
}


/**
 * Get all user posts be displayed 10 on a page
 * @param {Object} props 
 * @returns posts HTML
 */
function FetchPosts(props) {
    const [posts, setPosts] = React.useState([]);
    const [next, setNext] = React.useState();
    const [previous, setPrevious] = React.useState();
    const [error, setError] = React.useState();

    React.useEffect(() => {

        let endpoint = props.endpoint;
        setError();
        
        if (!(props.pagenum === null || props.pagenum === undefined)) {
            endpoint = `${props.endpoint}?page=${props.pagenum}`
        }

        fetch(endpoint)
        // .then(handleErrors)
        .then(response => {
            if (response.status == 204) {
                throw new Error(response.statusText);
            }

            return response.json();
        })
        .then(results => {
            if ("detail" in results) {
                throw new Error(results.detail);
            }

            setPosts(results.results);
            setNext(results.next);
            setPrevious(results.previous);
        })
        .catch(e => {
            console.log(e);
            setError(e.message);
            setPosts();
            setNext();
            setPrevious();
        });

    }, [props.forceUpdate]);


    return (
        <div className="">
            <p className="my-1">{ error }</p>
            <p className="my-1">{ posts.length == 0 && "No Contents." }</p>

            { posts && posts.map((post) =>
                <div className="border-bottom p-2 my-1" key={ post.id }>
                    <div className="d-flex flex-row">
                        <a className="align-self-center me-auto" href={ "#user/" + post.created_by.id }>
                            { post.created_by.username }
                        </a>
                        <p className="ml-auto align-self-center">
                            { post.created_at }
                        </p>
                    </div>
                    
                    <PostText text={post.text} id={post.id} 
                        userid={post.created_by.id} updated_at={post.updated_at}/>

                    <LikeAction postid={post.id} likeCount={post.like_count} isLiked={post.is_liked} />
                </div>
            )}

            <div className="d-flex flex-row mt-3">
                { previous != null &&
                    <button className="btn btn-sm btn-outline-info align-self-center" type="button" onClick={() => props.onPageClick(previous)}>
                        prev
                    </button>
                }
                { next != null &&
                    <button className="btn btn-sm btn-outline-info ms-auto align-self-center" type="button" onClick={() => props.onPageClick(next)}>
                        next
                    </button>
                }
            </div>
        </div>
    )
}


function UserInfo(props) {
    
    const [user, setUser] = React.useState([]);
    const [error, setError] = React.useState();
    const [isFollow, setIsFollow] = React.useState(false);

    React.useEffect(() => {

        fetch(`/api/v1/user/${props.userid}/`)
        // .then(handleErrors)
        .then(response => response.json())
        .then(results => {

            if ("error" in results) {
                throw new Error(results.error.detail);
            }

            setUser(results);
        })
        .catch(e => {
            console.log(e);
            setError(e.message);
            setUser();
        });

        if (user.id != loginUserId) {

            fetch(`/api/v1/user/check-follow/${props.userid}/`)
            // .then(handleErrors)
            .then(response => response.json())
            .then(result => {
                if ("error" in result) {
                    throw new Error(result.error.detail);
                }

                setIsFollow(result.check_follow);
            })
            .catch(e => {
                console.log(e);
                setIsFollow(false);
            });
        }

    }, [props.forceUpdate]);


    const handleFollow = () => {

        console.log("handleFollow");

        fetch(`api/v1/user/${props.userid}/follow/`, {
            method: "PUT",
            mode: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-NETWORKTOKEN" : Cookies.get("networktoken")
            }
        })
        // .then(handleErrors)
        .then(response => response.json())
        .then(result => {
            if ("error" in result) {
                throw new Error(result.error.detail);
            }

            setUser(result);
            setIsFollow(true);
        })
        .catch(e => console.log(e));
    }

    const handleUnfollow = () => {

        console.log("handleUnfollow");

        fetch(`api/v1/user/${props.userid}/follow/`, {
            method: "DELETE",
            mode: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-NETWORKTOKEN" : Cookies.get("networktoken")
            }
        })
        // .then(handleErrors)
        .then(response => response.json())
        .then(result => {
            if ("error" in result) {
                throw new Error(result.error.detail);
            }

            setUser(result)
            setIsFollow(false);
        })
        .catch(e => console.log(e));
    }


    return (
        <div className="mb-5">
            { user && !error &&
                <div className="mb-4">
                    <div className="d-flex flex-row">
                        <h2>
                            { user.username }
                        </h2>

                        <div className="ms-auto">
                            { isLogin == "True" && user.id != loginUserId &&
                                <>
                                    { isFollow ?
                                        <button className="btn btn-sm btn-outline-info" type="button" 
                                            onClick={ handleUnfollow } >UNFOLLOW</button> :
                                        <button className="btn btn-sm btn-outline-info" type="button" 
                                            onClick={ handleFollow } >FOLLOW</button>
                                    }
                                </>
                            }
                        </div>
                    </div>

                    <span className="pe-2">
                        Follow 
                        <a href={"#user/" + user.id + "/follow-users"} className="ms-1 text-decoration-underline">
                            { user.follow_count }
                        </a>
                    </span>
                    <span>
                        Follower 
                        <a href={"#user/" + user.id + "/follower-users"} className="ms-1 text-decoration-underline">
                            { user.follower_count }
                        </a>
                    </span>
                </div>
            }
        </div>
    )
}


// -----------------------------------------------------
// Parts component
// -----------------------------------------------------

class ScrollToTop extends React.Component {
    componentDidUpdate() {
        let elmnt = document.querySelector("body");
        elmnt.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
  
    render() {
      return this.props.children;
    }
  }


class PostText extends React.Component {
    
    constructor(props) {
        super(props)

        this.state = {
            text: this.props.text,
            count: this.props.text.length,
            isUpdated: this.props.updated_at ? true : false,
            beforeUpdateText: "",
            isEdit: false
        }
    }


    componentDidUpdate(prevProps) {

        if (prevProps.text != this.props.text) {
            this.setState({text: this.props.text});
        }
    }


    handleChange = (e) => {
        this.setState({beforeUpdateText: e.target.value});
        this.setState({count: e.target.value.length});
    }


    handleSubmit = (e) => {
        e.preventDefault();

        fetch(`/api/v1/post/${this.props.id}/`, {
            method: "PUT",
            mode: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-NETWORKTOKEN" : Cookies.get("networktoken")
            },
            body:JSON.stringify({
                text: this.state.beforeUpdateText
            })
        })
        .then(response => response.json())
        .then(result => {
            if ("error" in result) {
                throw new Error(result.error.detail);
            }

            this.setState({text: result.text});
            this.setState({count: result.text.length});
            this.setState({isUpdated: true});

            this.setState({isEdit: false});
        })
        .catch(error => {
            window.alert(error.message);
            console.log(error.message);
        })
    }


    handleForm = (e) => {
        e.preventDefault();

        this.setState({isEdit: true});
        this.setState({beforeUpdateText: this.state.text});
    }

    handleCancel = () => {
        this.setState({isEdit: false});
        this.setState({count: this.state.text.length});
    }


    render() {
        return (
            <div>
                { this.state.isEdit ?
                    <form method="POST" onSubmit={this.handleSubmit}>
                        <div className="form-group my-3">
                            <textarea className="form-control" maxLength="128"
                                value={ this.state.beforeUpdateText } 
                                onChange={ this.handleChange }></textarea>
                            <div className="text-end mt-1">
                                <span className="pe-1">
                                    { this.state.count } / 128
                                </span>
                                <button className="btn btn-sm btn-outline-success" type="submit" name="submit">UPDATE</button>
                                <button className="ms-1 btn btn-sm btn-light" type="button" name="cancel" 
                                    onClick={() => this.handleCancel()}>CANCEL</button>
                            </div>
                        </div>
                    </form> :
                    <div>
                        <p className="my-3 text-break break-spaces" style={{lineHeight: 1.6 + "em"}}>
                            { this.state.text }
                            { this.state.isUpdated &&
                                <span className="text-secondary ps-1 fst-italic">(edit)</span>
                            }
                        </p>
                        <p className="text-end">
                            { Number(loginUserId) === this.props.userid &&
                                <a href="!#" className="text-decoration-underline text-secondary" onClick={ this.handleForm }>
                                    EDIT
                                </a>
                            }
                        </p>
                    </div>
                }
            </div>
        )
    }
}


class NewPost extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            text: "",
            count: 0
        }
    }

    handleChange = (e) => {
        this.setState({text: e.target.value});
        this.setState({count: e.target.value.length});
    }

    handleSubmit = (e) => {
        e.preventDefault();

        this.setState({text: ""});

        fetch("/api/v1/post/", {
            method: "POST",
            mode: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-NETWORKTOKEN" : Cookies.get("networktoken")
            },
            body:JSON.stringify({
                text: this.state.text
            })
        })
        .then(response => {
            if (response.status == 201) {
                return this.props.submitSuccess(true);
            }
        })
        .catch(error => console.log(error))
    }

    render() {
        return (
            <div className="mb-5">
                <form method="POST" onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <textarea className="form-control" maxLength="128"
                            value={ this.state.text } 
                            onChange={ this.handleChange }></textarea>
                        <div className="text-end mt-1">
                            <span className="pe-1">
                                { this.state.count} / 128
                            </span>
                            <button className="btn btn-sm btn-outline-success" type="submit" name="submit">POST</button>
                        </div>
                    </div>
                </form> 
            </div>
        )
    }
}


class LikeAction extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            isLikedAtm: this.props.isLiked,
            likeCount: this.props.likeCount
        }
    }

    handleClick = () => {

        if (this.state.isLikedAtm) {

            // unliked
            fetch(`/api/v1/post/${this.props.postid}/like/`, {
                method: "DELETE",
                mode: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-NETWORKTOKEN" : Cookies.get("networktoken")
                },
            })
            // .then(handleErrors)
            .then(response => response.json())
            .then(result => {
                this.setState({isLikedAtm: false});

                // let count = Number(this.state.likeCount) - 1;
                // console.log(result.count);
                this.setState({likeCount: result.count});
            })
            .catch(error => console.log(error));
        } else {

            // liked
            fetch(`/api/v1/post/${this.props.postid}/like/`, {
                method: "PUT",
                mode: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-NETWORKTOKEN" : Cookies.get("networktoken")
                },
            })
            // .then(handleErrors)
            .then(response => response.json())
            .then(result => {
                this.setState({isLikedAtm: true});

                // let count = Number(this.state.likeCount) + 1;
                console.log(result.count)
                this.setState({likeCount: result.count});
            })
            .catch(error => console.log(error));
        }
    }

    render() {
        let className ="fas fa-heart pointer";
        if (this.state.isLikedAtm) {
            className += " red"
        }else {        
            className += " gray";
        }

        return (
            <div>
                { isLogin == "True" ?
                    <span onClick={ this.handleClick }>  
                        <i className={className}></i> { this.state.likeCount }
                    </span> : 
                    <span>  
                        <i className={className}></i> { this.state.likeCount }
                    </span>
                }
            </div>
        )
    }
}

// -----------------------------------------------------
// Page component
// -----------------------------------------------------


class Post extends React.Component {
    
    constructor(props) {
        super(props)

        this.state = {
            param: null,
            text: null,
            bool: false,
            error: "",
            pagenum: this.props.match.params.num ? this.props.match.params.num : null,
            pathname: this.props.history.location.pathname
        }
    }

    componentDidUpdate(prevProps) {
        let pathname = this.props.history.location.pathname;

        if (prevProps.location.pathname != pathname) {

            // Default pagenum is null that is page1.
            // FetchPosts be recreated is when satate's pathname changed.
            if ("num" in this.props.match.params) {
                this.setState({pagenum: this.props.match.params.num});
                this.setState({pathname: `/page=${this.props.match.params.num}`});
            }else {
                this.setState({pagenum: null});
                this.setState({pathname: "/"});
            }

            // FetchPosts be recreated is when state's bool changed.
            // It doesn't matter true or false.
            this.setState({bool: this.state.bool ? false : true});
        }
    }

    turnPage(endpoint) {
        let query = useQuery(endpoint);
        let pathname = "/"

        if (query.get("page")) {
            pathname = `/page=${query.get("page")}`
        }

        this.setState({pagenum: query.get("page")});
        this.setState({pathname: pathname});

        this.props.history.push(pathname);
    }

    recreatedPage(bool) {

        if (bool === true) {
            this.props.history.push("/");

            // FetchPosts be recreated is when state's bool changed.
            // It doesn't matter true or false.
            this.setState({bool: this.state.bool ? false : true});
        }
    }

    render() { 
        return (
            <div>
                { this.state.error ?
                    <p className="my-4 p-3 text-white rounded-1 bg-danger">
                        { this.state.error }
                    </p> :
                    <ScrollToTop>
                        <div>
                                { isLogin == "True" &&
                                    <NewPost
                                        submitSuccess={(bool) => this.recreatedPage(bool)} />
                                }
                                <FetchPosts 
                                    endpoint="/api/v1/post/"
                                    pagenum={ this.state.pagenum } 
                                    forceUpdate={ this.state.bool }
                                    onPageClick={(endpoint) => this.turnPage(endpoint)} />
                        </div>
                    </ScrollToTop>
                }
            </div>
        )
    }
}


class Following extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            id: this.props.match.params.userid,
            bool: false,
            error: "",
            pagenum: this.props.match.params.num ? this.props.match.params.num : null,
            pathname: this.props.history.location.pathname
        }
    }

    componentDidMount() {

        if (isLogin == "False") {
            // console.log("false");
            window.location.href = "/login";
        }
    }

    componentDidUpdate(prevProps) {
        let pathname = this.props.history.location.pathname;
        let userid = this.props.match.params.userid;

        if (prevProps.location.pathname != pathname) {
            if (prevProps.match.params.userid != userid) {
                // When userid changed.
                this.setState({id: this.props.match.params.userid});

                // UserInfo be recreated is when state's bool changed.
                // It doesn't matter true or false.
                this.setState({bool: this.state.bool ? false : true});
            }

            // Default pagenum is null that is page1.
            // FetchPosts be recreated is when satate's pathname changed.
            if ("num" in this.props.match.params) {
                this.setState({pagenum: this.props.match.params.num});
                this.setState({pathname: `/following/${this.state.id}/page=${this.props.match.params.num}`});
            }else {
                this.setState({pagenum: null});
                this.setState({pathname: `/following/${this.state.id}`});
            }

            // FetchPosts be recreated is when state's bool changed.
            // It doesn't matter true or false.
            this.setState({bool: this.state.bool ? false : true});
        }
    }

    turnPage(endpoint) {
        let query = useQuery(endpoint);
        let pathname = `/following/${this.state.id}`

        if (query.get("page")) {
            pathname = `/following/${this.state.id}/page=${query.get("page")}`
        }

        this.setState({pagenum: query.get("page")});
        this.setState({pathname: pathname});

        this.props.history.push(pathname);
    }

    render() {
        return (
            <ScrollToTop>
                <div>
                    <FetchPosts 
                        endpoint={"/api/v1/user/" + this.state.id + "/following-posts"}
                        pagenum={ this.state.pagenum } 
                        forceUpdate={ this.state.bool }
                        onPageClick={(endpoint) => this.turnPage(endpoint)} />
                </div>
            </ScrollToTop>
        )
    }
}


class Profile extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            id: this.props.match.params.userid,
            infoBool: false,
            postBool: false,
            pagenum: this.props.match.params.num ? this.props.match.params.num : null,
            pathname: this.props.history.location.pathname
        }
    }


    componentDidUpdate(prevProps) {
        let pathname = this.props.history.location.pathname;
        let userid = this.props.match.params.userid;

        if (prevProps.location.pathname != pathname) {
            if (prevProps.match.params.userid != userid) {
                // When userid changed.
                this.setState({id: this.props.match.params.userid});

                // UserInfo be recreated is when state's bool changed.
                // It doesn't matter true or false.
                this.setState({infoBool: this.state.infoBool ? false : true});
            }

            // Default pagenum is null that is page1.
            // Fetchposts be recreated is when satate's pathname changed.
            if ("num" in this.props.match.params) {
                this.setState({pagenum: this.props.match.params.num});
                this.setState({pathname: `/user/${this.state.id}/page=${this.props.match.params.num}`});
            }else {
                this.setState({pagenum: null});
                this.setState({pathname: `/user/${this.state.id}`});
            }

            // Fetchposts be recreated is when state's bool changed.
            // It doesn't matter true or false.
            this.setState({postBool: this.state.postBool ? false : true});
        }
    }

    turnPage(endpoint) {
        let query = useQuery(endpoint);
        let pathname = `/user/${this.state.id}`

        if (query.get("page")) {
            pathname = `/user/${this.state.id}/page=${query.get("page")}`
        }

        this.setState({pagenum: query.get("page")});
        this.setState({pathname: pathname});

        this.props.history.push(pathname);
    }

    
    render() {
        return (
            <div>
                <ScrollToTop>
                    <div>
                        <UserInfo userid={this.state.id} 
                            forceUpdate={ this.state.infoBool }/>

                        <FetchPosts 
                            endpoint={"/api/v1/user/" + this.state.id + "/posts"}
                            pagenum={ this.state.pagenum } 
                            forceUpdate={ this.state.postBool }
                            onPageClick={(endpoint) => this.turnPage(endpoint)} />
                    </div> 
                </ScrollToTop>  
            </div>
        )
    }
}


class FollowUsers extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            username: "",
            follows: [],
            error: "",
        }
    }

    fetchFollow = (id) => {

        fetch(`/api/v1/user/${id}/follow-user/`)
        // .then(handleErrors)
        .then(response => {
            if (response.status == 204) {
                throw new Error(response.statusText);
            }

            return response.json();
        })
        .then(results => {
            if ("detail" in results) {
                throw new Error(results.detail);
            }

            this.setState({follows: results});
        })
        .catch(e => {
            this.setState({error: e.message});
            console.log(e);
        }); 
    }


    fetchUser = (id) => {

        fetch(`/api/v1/user/${id}`)
        // .then(handleErrors)
        .then(response => response.json())
        .then(results => {
            if ("detail" in results) {
                throw new Error(results.detail);
            }

            this.setState({username: results.username});
        })
        .catch(e => console.log(e));
    }

    componentDidMount() {
        this.setState({error: ""});

        this.fetchUser(this.props.match.params.userid);
        this.fetchFollow(this.props.match.params.userid);
    }


    componentDidUpdate(prevProps) {

        if (prevProps.match.params.userid != this.props.match.params.userid) {
            this.fetchUser(this.props.match.params.userid);
            this.fetchFollow(this.props.match.params.userid);
        }
    }
    
    
    render() {
        return (
            <div>
                { this.state.username && 
                    <h2>{ this.state.username }'s Follow Users</h2>
                } 

                <div>
                    <p className="my-1">{ this.state.error }</p>
                    <p className="my-1">{ this.state.follows.length == 0 && "No Contents." }</p>

                    { this.state.follows.map((user) =>
                        <div className="border-bottom p-2 my-1" key={ user.id }>
                            <a href={"/#user/" + user.id}>
                                <h5>{user.username}</h5>
                            </a>

                            <span className="pe-2">
                                Follow 
                                <a href={"#user/" + user.id + "/follow-users"} className="ms-1 text-decoration-underline">
                                    { user.follow_count }
                                </a>
                            </span>
                            <span>
                                Follower 
                                <a href={"#user/" + user.id + "/follower-users"} className="ms-1 text-decoration-underline">
                                    { user.follower_count }
                                </a>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}


class FollowerUsers extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            username: "",
            followers: [],
            error: ""
        }
    }

    fetchFollowers = (id) => {

        fetch(`/api/v1/user/${id}/follower-user/`)
        // .then(handleErrors)
        .then(response => {
            if (response.status == 204) {
                throw new Error(response.statusText);
            }

            return response.json();
        })
        .then(results => {
            if ("detail" in results) {
                throw new Error(results.detail);
            }

            this.setState({followers: results});
        })
        .catch(e => {
            this.setState({error: e.message});
            console.log(e);
        }); 
    }


    fetchUser = (id) => {

        fetch(`/api/v1/user/${id}`)
        // .then(handleErrors)
        .then(response => response.json())
        .then(results => {
            if ("detail" in results) {
                throw new Error(results.detail);
            }

            this.setState({username: results.username});
        })
        .catch(e => console.log(e));
    }


    componentDidMount() {
        this.setState({error: ""});

        this.fetchUser(this.props.match.params.userid);
        this.fetchFollowers(this.props.match.params.userid);
    }


    componentDidUpdate(prevProps) {

        if (prevProps.match.params.userid != this.props.match.params.userid) {
            this.fetchUser(this.props.match.params.userid);
            this.fetchFollowers(this.props.match.params.userid);
        }
    }
    
    render() {
        return (
            <div>
                { this.state.username &&
                    <h2>{ this.state.username }'s Follower Users</h2>
                }

                <div>
                    <p className="my-1">{ this.state.error }</p>
                    <p className="my-1">{ this.state.followers.length == 0 && "No Contents." }</p>

                    { this.state.followers.map((user) =>
                        <div className="border-bottom p-2 my-1" key={ user.id }>
                            <a href={"/#user/" + user.id}>
                                <h5>{user.username}</h5>
                            </a>

                            <span className="pe-2">
                                Follow 
                                <a href={"#user/" + user.id + "/follow-users"} className="ms-1 text-decoration-underline">
                                    { user.follow_count }
                                </a>
                            </span>
                            <span>
                                Follower 
                                <a href={"#user/" + user.id + "/follower-users"} className="ms-1 text-decoration-underline">
                                    { user.follower_count }
                                </a>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}


class NotFound extends React.Component {

    constructor(props) {
        super(props)

    }

    render() {
        return(
            <div>
                Page Not Found.
            </div>
        )
    }
}

// -----------------------------------------------------
// Main
// -----------------------------------------------------

class Main extends React.Component {

    render() {
        return (
            <ReactRouterDOM.HashRouter
                hashType="noslash"
                basename="/"
                history={() => useHistory()}
                location={() => useLocation()}
                params={() => useParams()}>
                <Switch>
                    <Route exact path={["/", "/page=:num"]} component={Post} />
                    <Route exact path={["/following/:userid", "/following/:userid/page=:num"]} component={Following} />
                    <Route exact path={["/user/:userid", "/user/:userid/page=:num"]} component={Profile} />
                    <Route exact path="/user/:userid/follow-users" component={FollowUsers} />
                    <Route exact path="/user/:userid/follower-users" component={FollowerUsers} />
                    <Route exact path="*" component={NotFound} />
                </Switch>
            </ReactRouterDOM.HashRouter>
        )
    }
}


ReactDOM.render(
    <Main />,
    document.querySelector("#main")
);


