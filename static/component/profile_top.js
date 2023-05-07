import my_posts from './my_posts.js'
import navbar from './navbar.js'

export default{
    template:`
    <div>
    <navbar/>
    <br> 

    <div class="row">
      <div class="col-2 px-4">
      <figure v-if="user_data.length > 0"> 
      <h5 style="text-align: center;"> <img :src="'../static/user_profile_pics/'+user_data[0].profile_picture" alt="Avatar" class="avatar1" style="height:100px; width:100px;">    
      <br>
      <figcaption style="font-size: 15px;">{{user_data[0].name}}</figcaption>
      </h5>
      </figure>
      </div>
      <div class="col-1 px-2">
      </div>
      <div class="col-3 px-5" style="font-size:20px;">
      Posts
      </div>
      <div class="col-3 px-3">
      <a href="/#/following" style="font-size:20px;">Follow</a>
      </div>
      <div class="col-3 px-1">
      <a href="/#/followers" style="font-size:20px;">Followers</a>
      </div>     
    </div>


    <div class="row top1">
    <div class="col-3"> 
    </div>
    <div class="col-3">
    <p style="margin-left:50px;"> {{total_posts}} </p>
    </div>
    <div class="col-3">
    <p style="margin-left:20px;"> {{following_count}} </p>
    </div>
    <div class="col-3">
    <p style="margin-left:20px;"> {{followers_count}} </p>
    </div>     
  </div>

<br><br>

  <div class="row px-3 mx-3">
  <div class="px-4">
  <div class="col-8 col-sm-12"> 
        <router-link to="/add_post">
            <button type="button" class="btn btn-primary">Create </button></h3>
        </router-link>
       

<!--IMPORT BUTTON STARTS-->

<!-- Button trigger modal -->
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
  Import
</button>

<!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Import a CSV File</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">

       <div>
            <div class="form-group">
            <label for="exampleProfilePic" style="margin-top:10px;">Upload a CSV File</label><br><br>
            <input type="file" class="form-control-file" id="exampleFormControlFile1" @change="file_uploaded">
            </div>
       </div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" @click="upload_csv_file" data-bs-dismiss="modal">Upload</button>
      </div>
    </div>
  </div>
</div>
<!--IMPORT BUTTON ENDS-->
 
  </div>
</div>

    <br>
    <my_posts> </my_posts>
   
  </div>   
</div>
    `,
    mounted:function(){
        fetch("http://127.0.0.1:5000/api/getuserdetails").then(response=>response.json()).then(response1=>{console.log(response1)
            this.user_data=response1})
            console.log(this.user_data)  
            
        fetch("http://127.0.0.1:5000/api/getfollowdetails/currentuser").then(response=>response.json()).then(response1=>{console.log(response1)
        this.following_count=Object.keys(response1[0]["iamfollowing"]).length -1
        this.followers_count=Object.keys(response1[0]["followingme"]).length - 1
        })

        fetch("http://127.0.0.1:5000/api/getmyposts").then(response=>response.json()).then(response1=>{console.log(response1)
        this.total_posts=Object.keys(response1).length})
        console.log(this.total_posts)
    },
    data:function(){
        return{
            user_data:[],
            following_count:0,
            followers_count:0,
            total_posts:0,
            csv_file:null,
        }
    },
    methods: {
        file_uploaded(event){
          this.csv_file = event.target.files[0]
        },

        upload_csv_file() {
              const form_data = new FormData()
              form_data.append("csv_file", this.csv_file)
        
            fetch('http://127.0.0.1:5000/api/celery_import_post', {
              method:"POST",
              body: form_data,
            }).then(r => r.json()
            ).then(d => {
              console.log("Celery Task Details:", d);
              let interval = setInterval(() => {
                fetch(`http://127.0.0.1:5000/api/status/${d.Task_ID}`).then(r => r.json()
                ).then(d => {
                    console.log("same messsage", d)
                    if (d.Task_State === "SUCCESS") {
                      console.log("task finished")
                      clearInterval(interval);
                      location.reload();
                    }
                    else {
                      console.log("same messsage", d)
                      console.log("task still executing111")
                    }
                })
              }, 1000)
            })
          },


        // upload_csv_file(){
        //     const form_data = new FormData()
        //     form_data.append("csv_file", this.csv_file)     
        //     fetch('http://127.0.0.1:5000/api/celery_import_post', {
        //     method:"POST",
        //     body: form_data,
        //   }).then(response => response.json()).then(response1 => {
        //     console.log(response1)
        //     location.reload();
        // })      
        // },
    },
    components:{
        my_posts,
        navbar,
    },
}