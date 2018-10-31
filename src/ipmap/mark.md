#源码修改



#备注




#测试过程
    以添加一个ipline层为例，与line的功能完全一样，熟悉新版本mapbox的过程。
1、在style-spec/reference/v8.json中，复制line相关属性至ipline，并修改相关属性前缀。
    （1）在layer/type下，复制line，添加ipline
    （2）复制layout-line，添加layout-ipline，并修改相关前缀为ipline
    （3）复制paint-line，添加paint-ipline，并修改相关前缀为ipline
    
    
3、复制data/bucket下的line_bucket和line_attributes，添加ipline_bucket和ipline_attributes，并修改相关前缀。
    （1）修改引入正确的styleLayer和layoutAttributes
    （2）修改LineBucket为IPLineBucket
    （3）pattern_bucket_feature暂时未改动。 修改hasPattern前缀
    （4）修改属性前缀为ipline
    （5）修改export default和register函数
    
    
3、复制style/style_layer下的line_style_layer和line_style_layer_properties，添加ipline_style_layer和ipline_style_layer_properties，并修改相关前缀
    （1）将ipline_style_layer_properties中的相关前缀，改为ipline
    （2）修改ipline_style_layer引入正确的bucket和layer_properties
    （3）修改LineStyleLayer为IPLineStyleLayer
    （4）修改属性前缀为ipline
    （5）修改export default

3、在style-spec/types中添加IPLineLayerSpecification，并修改相关前缀 （无效？）

4、在style/create_style_layer中添加IPLineStyleLayer
    （1）在subclasses中注册ipline
    

5、复制render下draw_line、render/program下line_program，添加draw_ipline、ipline_program
    （1）修改ipline_program，修改相应的引入及前缀
    （2）修改draw_ipline，修改相应的引入及前缀。修改drawLine为drawIPLine
    （3）复制着色器程序line，添加ipline
    （4）在shaders/index中注册ipline
    （3）修改programId为ipline
    
5、在render/program/program_uniforms下，注册ipLine
    
6、在render/painter中，引入ipLine，并在draw中添加ipLine