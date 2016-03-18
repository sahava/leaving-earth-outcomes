//
//  ViewController.swift
//  Leaving Earth Outcomes
//
//  Created by Simo Ahava on 15/02/16.
//  Copyright © 2016 Simo Ahava. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        let path = NSBundle.mainBundle().URLForResource("Outcomes", withExtension: "html")
        let request = NSURLRequest(URL:path!);
        
        let myWebView:UIWebView = UIWebView(frame: CGRectMake(0, 20, UIScreen.mainScreen().bounds.width, UIScreen.mainScreen().bounds.height))
        myWebView.loadRequest(request)
        myWebView.scrollView.bounces = false
        
        self.view = myWebView
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func prefersStatusBarHidden() -> Bool {
        return true
    }


    override func shouldAutorotate() -> Bool {
        return true
    }
    
}

