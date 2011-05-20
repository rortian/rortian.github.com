/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.jeremy.data;


import java.io.InputStream;


/**
 *
 * @author Jeremy
 */
public class Networks {

    



    public static InputStream bhtv(){
        Networks hi = new Networks();
        InputStream br = hi.getClass().getResourceAsStream("bhtv_pairings");
        return br;
    }

    public static InputStream hor(){
        Networks hi = new Networks();
        InputStream br = hi.getClass().getResourceAsStream("hor_links");
        return br;
    }

    public static InputStream wittg3(){
        Networks hi = new Networks();
        InputStream br = hi.getClass().getResourceAsStream("wittg_links-3");
        return br;
    }

    public static InputStream wittg2(){
        Networks hi = new Networks();
        InputStream br = hi.getClass().getResourceAsStream("wittg_links-2");
        return br;
    }

    public static InputStream toobin1(){
        Networks hi = new Networks();
        InputStream br = hi.getClass().getResourceAsStream("toobin_links-1");
        return br;
    }

    public static InputStream toobin2(){
        Networks hi = new Networks();
        InputStream br = hi.getClass().getResourceAsStream("toobin_links-2");
        return br;
    }

    public static void main(String[] args){
        bhtv();
    }

}
