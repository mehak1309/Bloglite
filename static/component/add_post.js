import navbar from './navbar.js'

export default{
    template:`
    <div>
    <navbar/> 
    <br><br><p style="text-align:center; font-size:30px;"> Add a Post + </p><br>
    <div class="card container px-6 col-lg-4 col-md-8 col-sm-6 col-xs-2 mx-auto my-auto">
    <div class="card-body">
    <form>
    <div class="form-group">
    <label for="exampleName1" style="margin-top:10px;">Title</label>
    <input type="text" class="form-control" id="exampleInputEmail1" placeholder="Title" v-model="title1">
   </div>
   <div class="form-group">
   <label for="exampleInputEmail1" style="margin-top:10px;">Description</label>
   <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Description" v-model="caption1">
  </div>
   <div class="form-group">
   <label for="exampleProfilePic" style="margin-top:10px;">Image</label><br>
   <input type="file" class="form-control-file" id="exampleFormControlFile1" @change="file_uploaded">
  </div>
  <br>
  <router-link to="/profile">
   <button type="button" class="btn btn-primary" @click="post_data">Post</button>
   </router-link>
   <form action="/#/newsfeed" method="get">
   <router-link to="/profile">
   <button type="button" class="btn btn-secondary" style="margin-top:-67px;margin-left:65px;">Cancel</button> 
   </router-link>
   </form>
   </form> 
   </div>
   </div> 
   </div>
    `,
    mounted:function(){
      document.title = "Add Post"
    },
  components:{
      navbar,
   },
   data:function(){
    return{
      post_picture1:null,
      title1:null,
      caption1:null,
    }
   },
   methods: {
    file_uploaded(event){
      this.post_picture1 = event.target.files[0]
    },
    post_data(){
        const form_data = new FormData()
        form_data.append("title", this.title1)
        form_data.append("post_picture", this.post_picture1)
        form_data.append("caption", this.caption1)
        console.log(form_data["title"])        
        fetch('http://127.0.0.1:5000/api/add_post', {
        method:"POST",
        body: form_data,
      }).then(response => response.json()).then(response1 => {
        console.log(response1)
        location.reload()})      
    }
   }
  }



  
