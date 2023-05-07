export default{
    template:`
    

    <nav class="navbar navbar-expand-lg bg-primary">
    <div class="container-fluid">
      <a class="navbar-brand" href="/#/newsfeed"  style="color:rgb(255, 255, 255);">BlogLite</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li class="nav-item">
          <router-link to="/newsfeed">
            <a class="nav-link active" aria-current="page" href="/newsfeed" style="color:rgb(255, 255, 255);">Newsfeed</a>
          </router-link>
          </li>
          
          <li class="nav-item">
            <router-link to="/profile">
            <a class="nav-link" href="/profile" style="color:rgb(255, 255, 255);">Profile</a>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link to="/search">
            <a class="nav-link" href="/search" style="color:rgb(255, 255, 255);">Search</a>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/account">
            <a class="nav-link" href="/edit_account" style="color:rgb(255, 255, 255);">Account</a>
            </router-link>
          </li>   
          <li>

          </li>
          <li class="nav-item">
            <a class="nav-link" style="color:rgb(255, 255, 255);" href='/logout' @click="logout_from_app">Logout</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
    `,
    mounted:function(){
      fetch("http://127.0.0.1:5000/api/getuserdetails").then(response=>response.json()).then(response1=>{console.log(response1)
        this.profile_picture1=response1[0].profile_picture})
        console.log(this.user_data)
    },
    data:function(){
      return{
        profile_picture1:"",
      }  
    },
    methods:{
      logout_from_app(){
        fetch('http://127.0.0.1:5000/api/logout', {
          method: "GET",
          headers:{
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem("authentication-token"),
          }}).then(response=>response.json()).then(response1=>{console.log(response1)
                                                           localStorage.removeItem('authentication-token')
                                                           response1.delete_cookie('session')
                                                           this.$router.push("/login")})
        
      }
    }
}
  
//logout only removes cookies. therefore, manually remove the auth_token.  
