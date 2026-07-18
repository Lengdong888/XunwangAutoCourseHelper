// ==UserScript==
// @name         武汉讯网助学刷课助手
// @namespace    https://github.com/Lengdong888
// @version      1.0.0
// @author       Lengdong888
// @description  武汉理工大学继续教育平台自动答题、关闭解析、视频结束自动下一节，支持跨章节连续播放
// @homepageURL  https://github.com/Lengdong888/XunwangAutoCourseHelper
// @supportURL   https://github.com/Lengdong888/XunwangAutoCourseHelper/issues
// @license      MIT
// @icon         https://github.com/Lengdong888/XunwangAutoCourseHelper/blob/main/script-icon.png
// @match        *://jypxzx.whut.edu.cn/*
// @match        *://*.whxunw.com/*
// @grant        none
// ==/UserScript==

(function () {

    'use strict';


    let answering = false;



    //================================
    // 自动答题
    //================================

    function autoAnswer(){


        document
        .querySelectorAll(
            '.dilog,.dialog,[role="dialog"]'
        )
        .forEach(dialog=>{


            let text =
                dialog.innerText || "";



            if(
                text.includes("看累了") ||
                text.includes("做道题")
            ){


                if(answering)
                    return;


                answering=true;


                console.log(
                    "检测到答题弹窗"
                );



                let options =
                dialog.querySelectorAll(
                    'li,label,.option,.answer,.item,div'
                );



                let selected=false;



                for(let item of options){


                    let t =
                    item.innerText
                    ?.trim();



                    if(
                        t==="A" ||
                        t.startsWith("A.") ||
                        t.startsWith("A、")
                    ){


                        item.click();


                        console.log(
                            "选择A"
                        );


                        selected=true;

                        break;

                    }


                }




                if(
                    !selected &&
                    options.length
                ){

                    options[0].click();


                    console.log(
                        "选择第一项"
                    );

                }





                setTimeout(()=>{


                    dialog
                    .querySelectorAll("button")
                    .forEach(btn=>{


                        let t =
                        btn.innerText.trim();



                        if(
                            t==="确定" ||
                            t==="提交"
                        ){

                            console.log(
                                "提交答案"
                            );


                            btn.click();

                        }


                    });



                    answering=false;


                },1200);



            }








            //关闭解析

            if(
                text.includes("标准答案")
            ){


                dialog
                .querySelectorAll("button")
                .forEach(btn=>{


                    if(
                        btn.innerText.trim()
                        ==="关闭"
                    ){


                        setTimeout(()=>{


                            console.log(
                                "关闭解析"
                            );


                            btn.click();


                        },500);


                    }


                });


            }



        });


    }








    //================================
    // 视频结束监听
    //================================

    function bindVideo(){


        document
        .querySelectorAll("video")
        .forEach(video=>{


            if(video.dataset.bindEnd)
                return;



            video.dataset.bindEnd="true";



            console.log(
                "绑定视频结束"
            );



            video.addEventListener(
                "ended",
                ()=>{


                    console.log(
                        "视频播放结束"
                    );



                    setTimeout(()=>{


                        clickNextLesson();


                    },3000);



                }
            );


        });


    }










    //================================
    // 自动下一节（支持跨章节）
    //================================

    function clickNextLesson(){


        console.log(
            "寻找下一课程..."
        );



        let current =
        document.querySelector(
            "li.pointer.play"
        );



        if(!current){


            console.log(
                "没有找到当前课程"
            );


            return;

        }




        console.log(
            "当前课程:",
            current.innerText
        );






        //========================
        // 第一种情况：
        // 当前章节还有下一节
        //========================


        let next =
        current.nextElementSibling;



        while(next){


            if(
                next.classList &&
                next.classList.contains("pointer")
            ){


                console.log(
                    "进入下一节:",
                    next.innerText
                );


                next.click();

                return;


            }


            next =
            next.nextElementSibling;


        }







        console.log(
            "当前章节结束，寻找下一章"
        );








        //========================
        // 第二种情况：
        // 找下一章节
        //========================


        let chapters =
        [
            ...document.querySelectorAll(
                "div.fw-bold"
            )
        ];




        let currentChapter=-1;



        chapters.forEach((ch,index)=>{


            if(
                current.compareDocumentPosition(ch)
                &
                Node.DOCUMENT_POSITION_PRECEDING
            ){

                currentChapter=index;

            }


        });





        console.log(
            "当前章节:",
            currentChapter
        );





        let nextChapter =
        chapters[currentChapter+1];



        if(!nextChapter){


            console.log(
                "已经是最后一章"
            );


            return;

        }




        console.log(
            "下一章:",
            nextChapter.innerText
        );








        //========================
        // 找下一章第一个课程
        //========================


        let firstLesson=null;



        //方式1：章节父级里面找

        firstLesson =
        nextChapter
        .parentElement
        ?.querySelector(
            "li.pointer"
        );



        //方式2：往后搜索

        if(!firstLesson){


            let node =
            nextChapter.nextElementSibling;



            while(node){


                if(
                    node.classList &&
                    node.classList.contains("pointer")
                ){

                    firstLesson=node;

                    break;

                }


                node=node.nextElementSibling;


            }


        }





        if(firstLesson){


            console.log(
                "进入下一章第一节:",
                firstLesson.innerText
            );


            firstLesson.click();



        }else{


            console.log(
                "未找到下一章课程"
            );


        }



    }










    //================================
    // 主循环
    //================================

    function run(){


        autoAnswer();


        bindVideo();


    }



    setInterval(
        run,
        1000
    );





    new MutationObserver(()=>{


        if(!answering)
            run();



    })
    .observe(
        document.body,
        {
            childList:true,
            subtree:true
        }
    );



})();
