import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addPost, fetchPosts, fetchTags } from "../api/api"
import { useState } from "react";


const PostList = () => {

    const [page,setPage]=useState(1)
    const {data:postData,isError,error,isLoading} = useQuery({
        queryKey:['posts',{page}],
        queryFn:()=>fetchPosts(page),
        staleTime:1000*60*5
    });

    const {data:tagsData}=useQuery({
        queryKey:['tags'],
        queryFn:fetchTags
    })
    
    const queryClient=useQueryClient()

    const {mutate, isError:isPostError, error:postError, isPending,reset} = useMutation({
        mutationFn:addPost,
        onMutate:()=>{
            return {id:1}
        },
        onSuccess:(data,variables,context)=>{
            queryClient.invalidateQueries({
                queryKey:['posts'],
                exact:true
            })
        },
        // onError:(error,variables,context)=>{},
        // onSettled:(data,error,variables,context)=>{}
    })

    const handleSubmit=(e)=>{
        e.preventDefault()
        const formData=new FormData(e.target);
        const title=formData.get('title');
        const tags=Array.from(formData.keys()).filter(key=>formData.get(key)==='on');

        if(!title || !tags) return;
        mutate({id:postData?.data?.length+1,title,tags})
        e.target.reset()
    }
 
  return (
    <div className="container">
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Enter your post" className="postbox" name='title' />
            <div className="tags">
                {tagsData?.map(tag=>(
                     <div key={tag}>
                     <input type="checkbox" name={tag} id={tag} />
                     <label htmlFor={tag}>{tag}</label>
                 </div>
                ))}
            </div>
            <button>Post</button>
        </form>

        {isLoading && isPending && <p>Loading...</p>}
        {isError && <p>{error?.message}</p>}
        {isPostError && <p onClick={()=>reset()}>{postError?.message}</p>}


        <div className="pages">
            <button onClick={()=>setPage(oldPage=>Math.max(oldPage-1,0))} disabled={!postData?.prev}>Previous Page</button>
            <span>{page}</span>
            <button onClick={()=>setPage(oldPage=>oldPage+1)} disabled={!postData?.next}>Next Page</button>
        </div>
      {postData?.data?.map((post)=>(
        <div key={post.id} className="post">
            <h1>{post.title}</h1>
            {post.tags.map((tag,index)=><span key={index}>{tag}</span>)}
        </div>
      ))}
    </div>
  )
}

export default PostList
