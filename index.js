#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const spawn = require('cross-spawn')

const dependencies = [
    '@testing-library/jest-dom',
    '@testing-library/react',
    '@testing-library/user-event',
    'react',
    'react-dom',
    'react-scripts',
    'web-vitals'
]

const packageJson = {
    "name": "",
    "version": "0.1.0",
    "private": true,
    "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
    },
    "eslintConfig": {
        "extends": [
            "react-app",
            "react-app/jest"
        ]
    },
    "browserslist": {
        "production": [
            ">0.2%",
            "not dead",
            "not op_mini all"
        ],
        "development": [
            "last 1 chrome version",
            "last 1 firefox version",
            "last 1 safari version"
        ]
    }
}

function getAllFiles(root, prev = []) {
    let res = []
    const files = fs.readdirSync(root)
    files.forEach((file) => {
        const pathname = path.join(root, file)
        const stat = fs.lstatSync(pathname)
        const fileArr = [...prev, file]

        if (!stat.isDirectory()) {
            res.push(fileArr)
        } else {
            res = res.concat(getAllFiles(pathname, fileArr))
        }
    })
    return res
}

inquirer.prompt([
    {
        type: 'input',
        name: 'name',
        message: 'Project name:'
    }
]).then(answers => {
    const { name } = answers
    const packagesDir = path.join(__dirname, 'packages')
    const destDir = process.cwd()
    const root = path.join(destDir, name)

    fs.mkdir(root, (err) => {
        if (err) throw err

        packageJson.name = name
        fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 4))
    
        const allFiles = getAllFiles(packagesDir)
        allFiles.forEach(file => {
            fs.readFile(path.join(packagesDir, ...file), (err, data) => {
                if (err) throw err
                if (file.length > 1 && !fs.existsSync(path.join(root, file[0]))) {
                    fs.mkdirSync(path.join(root, file[0]))
                }
                fs.writeFileSync(path.join(root, ...file), data)
            })
        })
        process.chdir(root)

        spawn('npm', ['install', ...dependencies], { stdio: 'inherit' })
    })
})