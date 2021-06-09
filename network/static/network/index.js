class Main extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            text: null,
            isLogin: isLogin === 'True' ? true : false,
            posts: [],
            next: null,
            previous: null
        }
    }

    componentDidMount() {
        this.fetchAllPosts();
    }

    /**
     * Get all posts pf all users.
     * @returns {Json}
     */
    fetchAllPosts() {
        fetch("/api/v1/post/")
        .then(response => response.json())
        .then(results => {
            console.log(results);
            this.setState({posts: results['results'], next: results['next'], previous: results['previous']})
        })
        .catch(error => console.log(error))
    }

    /**
     * Create new post
     * @returns {Json}
     */
    NewPost() {
        fetch("/api/v1/post/", {
            method: "POST",
            mode: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-NETWORKTOKEN' : Cookies.get('networktoken')
            },
            body:JSON.stringify({
                text: this.state.text
            })
        })
        .then(response => {
            if (response.status == 201) {
                // Update all posts
                this.fetchAllPosts();
                this.setState({posts: results['results'], next: results['next'], previous: results['previous']})
            }
        })
        .catch(error => console.log(error))
    }

    getValue(val) {
        this.setState({text: val});
    }

    getSubmit() {
        this.NewPost();
        this.setState({text: null});
    }

    render() { 
        return (
            <div>
                <NewForm isLogin={this.state.isLogin} 
                    text={this.state.text}
                    clickSubmit={() => {this.getSubmit();}} 
                    setValue={(val) => {this.getValue(val);}} />
                <AllPosts posts={this.state.posts} />
            </div>
        )
    }
}


class AllPosts extends React.Component {

    render() {
        return (
            <div>
                {this.props.posts.map((post) =>
                    <p>{post.id} {post.text}</p>
                )}
            </div>
        )
    }
}

/**
 * New post form & all posts
 */
class NewForm extends React.Component {

    handleChange = (e) => {
        let value = e.target.value
        return this.props.setValue(value);
    }

    handleSubmit = (e) => {
        e.preventDefault();

        return this.props.clickSubmit();
    }

    render() {
        return (
            <div>
                {this.props.isLogin === true ?
                    <form method="POST" onSubmit={this.handleSubmit}>
                        <textarea value={this.props.text} onChange={this.handleChange}></textarea>
                        <button type="submit" name="submit">POST</button>
                    </form> 
                    : ""
                } 
            </div>
        )
    }
}


ReactDOM.render(<Main />, document.querySelector("#main"));
