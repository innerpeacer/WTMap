#源码修改



#备注




#测试过程(添加ipline)
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



#测试过程（为ipline添加高度）
1、在ipline.vertex.glsl上添加height定义，及height坐标输出。
2、在v8.json中声明ipline-height属性。
3、在ipline_style_layer_properties下paint中添加属性声明。



#测试过程（添加ipfill-extrusion)
######1、在style-spec/reference/v8.json中，复制fill-extrusion相关属性至ipfill-extrusion，并修改相关属性前缀。
    （1）在layer/type下，复制fill-extrusion，添加ipfill-extrusion
    （2）复制layout-fill-extrusion，添加layout-ipfill-extrusion，并修改相关前缀为ipfill-extrusion
    （3）复制paint-fill-extrusion，添加paint-ipfill-extrusion，并修改相关前缀为ipfill-extrusion

######2、复制style/style_layer下的fill-extrusion_style_layer和fill-extrusion_style_layer_properties，添加ipfill-extrusion_style_layer和ipfill-extrusion_style_layer_properties，并修改相关前缀
    （1）将ipfill-extrusion_style_layer_properties中的相关前缀，改为ipfill-extrusion
    （2）修改ipfill-extrusion_style_layer引入正确的bucket和layer_properties
    （3）修改fill-extrusionStyleLayer为IPfill-extrusionStyleLayer
    （4）修改属性前缀为ipfill-extrusion
    （5）修改export default

######3、复制data/bucket下的fill-extrusion_bucket和fill-extrusion_attributes，添加ipfill-extrusion_bucket和ipfill-extrusion_attributes，并修改相关前缀。
    （1）修改引入正确的styleLayer和layoutAttributes
    （2）修改fill-extrusionBucket为IPfill-extrusionBucket
    （3）pattern_bucket_feature暂时未改动。 修改hasPattern前缀
    （4）修改属性前缀为ipfill-extrusion
    （5）修改export default和register函数
    
######4、在style/create_style_layer中添加IPfill-extrusionStyleLayer
    （1）在subclasses中注册ipfill-extrusion
    
    
######5、复制render下draw_fill-extrusion、render/program下fill-extrusion_program，添加draw_ipfill-extrusion、ipfill-extrusion_program
    （1）修改ipfill-extrusion_program，修改相应的引入及前缀
    （2）修改draw_ipfill-extrusion，修改相应的引入及前缀。修改drawfill-extrusion为drawIPfill-extrusion
    （3）复制着色器程序fill-extrusion，添加ipfill-extrusion
    （4）在shaders/index中注册ipfill-extrusion
    （5）修改programId为ipfill-
    
######6、在render/program/program_uniforms下，注册ipfill-extrusion

######7、在render/painter中，引入ipfill-extrusion，并在draw中添加ipfill-extrusion




#融合ipfill-extrusion与ipline
######1、在v8.json中，将ipline的属性复制到ipfill-extrusion中，并修改相应前缀。
######2、复制ipline_style_layer_properties中属性至extrusion_style_layer_properties中，并修改相关前缀。
######3、融合ipline_style_layer进入ipfill-extrusion_style_layer
######4、融合ipline_attributes至ipfill_extrusion_attributes中。将两组数据组合一起。
######5、在array_types中添加StructArrayLayout2i4i4i4ub24，用于FillExtrusionLayoutArray

######6、将ipline_style_layer复制至ipfill_extrusion_style_layer中

######7、将ipline_bucket复制至ipfill_extrusion_bucket中

######8、将ipline_program融合至ipfill_extrsion_program中

######9、将draw_ipline复制至draw_ipfill_extrusion中

######10、融合ipline_bucket至ipfill_extrusion_bucket中

######11、复制ipline.glsl至ipfill_extrusion_outline.glsl，并注册到index.js中。在draw_ipfill_extrusion中使用相应的programId。在program_uniforms中补充ipfillExtrusionOutline，复制ipline内容，修改相应的着色器程序。
