<template>
    <div style="height: 100%;">
        <nv-head page-type="关于" :fix-head="true" :need-add="true" ></nv-head>
        
        <dl class="about-info">

            <dt>关于项目</dt>
            <dd>该项目是基于Cnodejs的模板，采用vue.js重写的webapp。</dd>
            
            <dt>当前版本</dt>
            <dd>V2.0</dd>

        </dl>
    </div>
</template>
<script>
    import nvHead from '../components/header.vue';
    export default {
        components: {
            nvHead
        }
    };
</script>