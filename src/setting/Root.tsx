import {Component, Fragment} from 'nano-jsx'
import {CustomCss, CustomDarkCss, SpectreCss, SpectreIconCss} from './css'
import {applications} from '../applications'
import {Application, Platform, ProjectItemImpl} from '../types'
import {SettingCard} from './components/SettingCard'
import {Catalogue} from './components/Catalogue'
import {Announcement} from './components/Announcement'
import {contain} from 'licia'
import {InformationCard} from './components/InformationCard'
import {compareChar, platformFromUtools} from '../utils'
import Nano = require('nano-jsx')

interface RootProps {}

interface RootState {
    applications: Array<Application<ProjectItemImpl>>
    platform: Platform
}

class Root extends Component<RootProps, RootState> {
    constructor(props: RootProps) {
        super(props)

        let platform = platformFromUtools()
        this.state = {
            applications: applications.filter(app => contain(app.platform, platform)),
            platform: platform,
        }
        this.state.applications.forEach(app => app.update(utools.getNativeId()))
    }

    render() {
        return (
            <Fragment>
                <head>
                    <title/>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1"
                    />
                    {/*引入样式文件*/}
                    <style>{SpectreCss}</style>
                    <style>{SpectreIconCss}</style>
                    <style>{CustomCss}</style>
                    <style>{CustomDarkCss}</style>
                    {/*保留 uTools 模板插件原本的 js 文件*/}
                    <script src="index.js"/>
                </head>
                <body
                    class={utools.isDarkColors() ? 'dark' : ''}
                    style={{ padding: '5px' }}
                >
                    {/*保留 uTools 模板插件原本的布局*/}
                    <div id="root"/>
                    <div class="container">
                        <div class="columns">
                            <div class="column col-3">
                                {/*左侧导航栏*/}
                                <Catalogue applications={this.state.applications}/>
                            </div>
                            <div class="column col-9">
                                {/*右侧配置信息*/}
                                {/*用户和系统信息*/}
                                <InformationCard platform={this.state.platform}/>
                                {/*具体应用配置信息*/}
                                {this.state.applications
                                    .sort((a1, a2) => compareChar(a1.group, a2.group))
                                    .map(app => <SettingCard application={app}/>)}
                                <div class="gap"/>
                                <div class="gap"/>
                            </div>
                        </div>
                    </div>
                    <Announcement/>
                </body>
            </Fragment>
        )
    }
}

export class ApplicationUI {
    render(root: HTMLElement) {
        Nano.render(<Root/>, root)
    }
}
