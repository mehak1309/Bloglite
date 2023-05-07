export default{
    template:`
    <div>
    <h1 style="border-top: 30px solid blue;"></h1>
    <br>
    
    <div class="card container px-6 col-lg-4 col-md-6 col-xs-2 mx-auto">
    <div class="card-body">
    <p style="text-align:center; font-size:30px;"> Sign Up to Bloglite </p> 
    <div>
  
    <form>
    <div class="form-group">
     <label for="exampleName1">Name</label>
     <input type="text" class="form-control" id="exampleName1" placeholder="Name" v-model="name">
    </div>
   <div class="form-group">
   <label for="exampleProfilePic" style="margin-top:10px;">Upload Picture</label><br>
   <input type="file" class="form-control-file" id="exampleFormControlFile1" @change="file_uploaded">
  </div>
   <div class="form-group">
     <label for="exampleInputEmail1" style="margin-top:10px;">Username</label>
     <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" v-model="email">
     <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
    </div>
   <div class="form-group">
     <label for="exampleInputPassword1" style="margin-top:10px;">Password</label>
     <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" v-model="password">
   </div> <br>
   <button type="button" @click="signup_data" class="btn btn-primary" style="width:100%;">Sign Up</button>
  </form>
  <br>
  <p style="text-align:center;"> {{message}}</p> 
  </div>
  </div>
</div> <br>
  <div class="card container px-6 col-lg-4 col-md-6 col-xs-2 mx-auto" style="height:65px;">
    <div class="card-body">
  <p style="margin-top:5px;color:rgb(90,90,90); font-size:14px;">Have an account? <router-link :to="'/'+'login'"> Login </router-link> </p>
  </div>

  </div>
  </div>
    `,
    mounted:function(){
      document.title = "Sign Up"
    },
    data:function(){
      return{
        name:null,
        profile_pic:null,
        email:null,
        password: null,
        message: null,
        show:false,
      }
    },
    methods:{
      file_uploaded(event){
        this.profile_pic = event.target.files[0]
      },
      signup_data(){
        const form_data = new FormData()
        form_data.append("email", this.email)
        form_data.append("password", this.password)
        form_data.append("name", this.name)
        form_data.append("profile_pic", this.profile_pic)
  
        
        fetch('http://127.0.0.1:5000/api/signup',{
          method: 'POST',
          body:form_data,
        }).then(response => response.json()).then(response1 => {if(response1.ok){this.$router.push("/login"); this.message=response1.msg} else {this.message=response1.msg}})
      }
    }
  }