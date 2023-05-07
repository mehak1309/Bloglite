export default {
    template: `
    <div>
    <h1 style="border-top: 30px solid blue;"></h1>
    <br><br><br>
    <p style="text-align:center;"></p> 
    <div class="card container px-6 col-lg-4 col-md-6 col-xs-2 mx-auto my-auto">
    <div class="card-body">
    <div>
    <p style="text-align:center; font-size:30px;"> Log in to Bloglite </p> <br> <br> 

    <form action=/newsfeed>
    <div class="form-group">
     <label for="exampleInputEmail1">Email</label>
     <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="email" name=_username_ v-model="email">
    </div>
   <div class="form-group">
     <label for="exampleInputPassword1">Password</label>
     <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" password=_password_ v-model="password">
   </div>
   <br>
   <button type="button" @click="login_data" class="btn btn-primary" style="width:100%;">Log in</button>
   </form> <br>
   <p style="text-align:center;"> {{message}}</p> 
  </div>
  
  </div>
  </div>
  <br>
  <div class="card container px-6 col-lg-4 col-md-6 col-xs-2 mx-auto">
    <div class="card-body">
   <p style="margin-top:5px;color:rgb(90,90,90); font-size:14px;">Don't have an account? <router-link :to = "'/'+'signup'"> Register </router-link> </p>
  </div>
  </div>
  </div>
  </div>
    `,
    mounted: function() {
        document.title = "Login"
    },
    data: function() {
        return {
            email: null,
            password: null,
            message: "",
        }
    },
    methods: {
        login_data() {
            //passing const data to line 36
            const data = {
                email: this.email, //value in line 21
                password: this.password
            }
            fetch('http://127.0.0.1:5000/login?include_auth_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).then(response => response.json()).then(response1 => {
                console.log(response1)
                localStorage.setItem("authentication-token", response1.response.user.authentication_token)
                this.$router.push("/newsfeed")
            }).catch(response1 => {
                this.message = "Some error occured. Please try again."
            })

        }
    }
}